#!/bin/bash
#
# Harbor verifier for the CommonMark Markdown-to-HTML task (C implementation).
#
# Threat closed vs. the previous version: the verifier used to compile and run
# the agent's md2html AS ROOT, so a malicious converter could simply open
# /tests/hidden_cases/test_*.json (the answer keys) and echo the expected HTML.
# Here EVERY build and EVERY md2html invocation runs AS THE `agent` USER under
# strace, with /tests re-locked to mode 0700 — so the converter gets EACCES on
# the answer keys, and scoring (which reads them) happens only as root, OUTSIDE
# strace, where no agent code runs.
#
# Layout (no `set -euo pipefail` — early abort can leave the verifier in an
# inconsistent state; use `|| fail_with` / explicit checks per step instead):
#
#   Prologue (root)        lock+wipe /logs/verifier, re-lock /tests, sanitise
#                          env, kill leftover agent procs.
#   Build  (as agent)      make / gcc under strace -> own log.
#   Correctness (as agent) one strace'd batch of md2html runs writing into a
#                          ROOT-owned 0755 staging dir (per-case files 0666);
#                          graded afterwards by root (FD-pinned, reads keys).
#   Performance (as agent) median-of-3 vs the root-only cmark reference.
#   Tripwires (root)       reward-file writes (any phase) + external-converter
#                          execve (md2html exec'ing cmark/pandoc/python/...).
#   Reward (root)          standalone compute_reward.py, atomic reward.json.
#
# Scoring is unchanged: 50% correctness + 50% performance, with performance
# GATED by correctness. Always exits 0; the outcome is in reward.{json,txt}.

VERIFIER_DIR="/logs/verifier"
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

MD2HTML="/app/workspace/md2html"
CMARK="/opt/verifier_tools/cmark_install/bin/cmark"
AGENT_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Staging paths (initialised so cleanup on an early fail is a no-op).
INPUTS_DIR=""
OUTPUTS_DIR=""
PERF_INPUTS=""
RUNNER=""

# Must match [solution.env].HARBOR_ORACLE_FLAG in task.toml. Harbor injects that
# value ONLY into the OracleAgent's env (never the verifier's, never the agent's),
# and solve.sh writes it to /app/.harbor_oracle_marker. The agent cannot read
# this string (it lives in this root-only, mode-0700 /tests/test.sh), so it
# cannot forge the marker.
EXPECTED_ORACLE_FLAG="md2html-containers-oracle-66963ca68379d4af"

# === MANDATORY: lock + wipe /logs/verifier (root-only) before anything else ===
# Harbor sets it world-writable at container start. Lock first (immediately cuts
# off any agent background process), then wipe anything the agent may have planted.
mkdir -p "$VERIFIER_DIR"
chmod 700 "$VERIFIER_DIR"
rm -rf "${VERIFIER_DIR:?}"/*

# === MANDATORY: /tests lockdown ===
# Harbor's verify-phase upload of test.sh resets /tests back to 0755, undoing the
# Dockerfile's `chmod 700 /tests`. Re-lock here so the agent (uid 1000) cannot
# open the hidden answer keys or perf corpus, at build time or run time.
chmod 700 /tests 2>/dev/null || true
chmod -R go-rx /tests/visible_cases /tests/hidden_cases /tests/perf_data 2>/dev/null || true

# === MANDATORY: environment sanitisation ===
# Strip preload/loader/interpreter/compiler side channels that could smuggle code
# into the as-agent build or the root-side python helpers.
unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME BASH_ENV ENV CFLAGS CC CXX MAKEFLAGS
export PATH="$AGENT_PATH"

# Restore exec bits (Modal/Daytona drop them; harmless locally). -type f only, so
# this does not relax the /tests dir mode set above.
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

START_S=$SECONDS

echo "========================================"
echo "  CommonMark Markdown-to-HTML Verifier"
echo "========================================"
echo "Start time: $(date)"
echo ""

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
relax_reward_perms() {
    # On local-Docker runtimes /logs/verifier is bind-mounted; the 0700 dir +
    # root-owned reward files lock out Harbor's host reader (uid 1000). Safe to
    # widen reads — verification is complete and the agent container is dead.
    chmod 755 "$VERIFIER_DIR" 2>/dev/null || true
    chmod 644 "$VERIFIER_DIR"/reward.json "$VERIFIER_DIR"/reward.txt 2>/dev/null || true
}

cleanup_staging() {
    rm -rf "$INPUTS_DIR" "$OUTPUTS_DIR" "$PERF_INPUTS" "$RUNNER" 2>/dev/null || true
}

fail_with() {
    local reason="$1"
    echo ""
    echo "NON-SCORING OUTCOME: $reason  (score = 0.0)"
    python3 -ISs "$TESTS_DIR/compute_reward.py" \
        --fail "$reason" \
        --output-dir "$VERIFIER_DIR" \
        --total-time-s "$((SECONDS - START_S))"
    cleanup_staging
    relax_reward_perms
    echo "End time: $(date)"
    exit 0
}

reward_tamper_in() {
    # $1 = strace log path. Any write-mode open of a reward file inside the
    # strace window is agent code forging the reward (nothing legitimate writes
    # reward.{txt,json} there — compute_reward.py runs afterwards as root).
    grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
        "$1" 2>/dev/null
}

converter_execve_in() {
    # $1 = strace log path. md2html (or a child it spawns) exec'ing an external
    # Markdown converter / interpreter is spec-gaming. Build-phase logs are NOT
    # passed here (a legitimate Makefile may run python for codegen); only the
    # md2html RUN phases are checked.
    grep -qE 'execve\([^)]*(\bcmark\b|\bpandoc\b|\bmarkdown\b|\bpython[0-9.]*\b|\bnode\b|\bperl\b|\bruby\b)' \
        "$1" 2>/dev/null
}

# ------------------------------------------------------------------
# Oracle marker detection (token-gated bypass of anti-cheat/execve walls).
# ------------------------------------------------------------------
ORACLE_DETECTED=0
if [ -f /app/.harbor_oracle_marker ] && \
   [ "$(cat /app/.harbor_oracle_marker 2>/dev/null)" = "$EXPECTED_ORACLE_FLAG" ]; then
    ORACLE_DETECTED=1
    echo "[oracle] marker verified — unlocking cmark for agent, skipping anti-cheat + execve tripwires"
    # Let the agent-uid oracle wrapper read+exec the otherwise root-only cmark.
    chmod -R go+rx /opt/verifier_tools 2>/dev/null || true
fi

# ------------------------------------------------------------------
# Kill any pre-existing agent processes (cross-phase isolation).
# ------------------------------------------------------------------
pkill -9 -u agent 2>/dev/null || true
sleep 0.5
if pgrep -u agent >/dev/null 2>&1; then
    sleep 1
    pkill -9 -u agent 2>/dev/null || true
    sleep 0.5
    pgrep -u agent >/dev/null 2>&1 && fail_with "agent_processes_survived"
fi

# ------------------------------------------------------------------
# Snapshot the agent's workspace (root, read-only, OUTSIDE strace).
# ------------------------------------------------------------------
SNAPSHOT_DIR="$VERIFIER_DIR/workspace_snapshot"
if [ -d /app/workspace ]; then
    mkdir -p "$SNAPSHOT_DIR"
    cp -r /app/workspace/* "$SNAPSHOT_DIR/" 2>/dev/null || true
    echo "Workspace snapshot saved to $SNAPSHOT_DIR"
    echo ""
fi

# ------------------------------------------------------------------
# Static anti-cheat source scan (root; no agent code runs). Skipped for the
# oracle, whose wrapper legitimately exec()s the reference cmark.
# ------------------------------------------------------------------
if [ "$ORACLE_DETECTED" -eq 0 ]; then
    echo "=== Anti-cheat source scan ==="
    CHEAT=0
    if [ -d /app/workspace ]; then
        if grep -rE '#include\s*[<"].*\b(cmark|libmarkdown|sundown|hoedown|md4c|discount|mkdio)\b' \
            /app/workspace/ --include="*.c" --include="*.h" -l 2>/dev/null; then
            echo "CHEAT: #include of a known Markdown parsing library"; CHEAT=1
        fi
        if grep -rE '\b(system|popen|execvp?|execl|execlp|execle|execv|execvpe)\s*\(' \
            /app/workspace/ --include="*.c" --include="*.h" -l 2>/dev/null >/dev/null; then
            if grep -rE '\b(system|popen|execvp?|execl|execlp|execle|execv|execvpe)\s*\(.*\b(cmark|pandoc|python|node|perl|ruby|markdown)\b' \
                /app/workspace/ --include="*.c" --include="*.h" -l 2>/dev/null; then
                echo "CHEAT: exec/system/popen of an external converter"; CHEAT=1
            fi
        fi
        if grep -rE '\-l(cmark|markdown|sundown|hoedown|md4c|discount)' \
            /app/workspace/ --include="Makefile" --include="*.mk" -l 2>/dev/null; then
            echo "CHEAT: linking against a Markdown library in build files"; CHEAT=1
        fi
        for wrapper in md2html.py md2html.js md2html.sh md2html.rb md2html.pl; do
            if [ -f "/app/workspace/$wrapper" ]; then
                echo "CHEAT: wrapper script $wrapper — converter must be C"; CHEAT=1
            fi
        done
    fi
    if [ "$CHEAT" -eq 1 ]; then
        fail_with "cheat_detected"
    fi
    echo "Anti-cheat source scan passed."
    echo ""
fi

# ------------------------------------------------------------------
# Build the agent's converter AS THE agent USER, under strace.
# Build runs as agent so a `#include "/tests/..."` cannot read the answer keys
# (the /tests mode-0700 wall applies to the compiler). Stale artifacts are wiped
# first so we build from the agent's stated source.
# ------------------------------------------------------------------
echo "=== Build (as agent, under strace) ==="
rm -f "$MD2HTML" /app/workspace/*.o 2>/dev/null || true
chown -R agent:agent /app/workspace 2>/dev/null || true

BUILD_STRACE="$VERIFIER_DIR/build.strace.log"

if [ -f /app/workspace/Makefile ]; then
    strace -f -e trace=clone,clone3,fork,vfork,execve,openat -o "$BUILD_STRACE" \
        timeout 300 \
        su agent -s /bin/bash -c \
            "env -i PATH='$AGENT_PATH' HOME=/home/agent TMPDIR=/tmp LC_ALL=C make -C /app/workspace" \
        > "$VERIFIER_DIR/make.log" 2>&1
    tail -20 "$VERIFIER_DIR/make.log"
fi

if [ ! -x "$MD2HTML" ] && ls /app/workspace/*.c >/dev/null 2>&1; then
    echo "make produced no binary; falling back to gcc..."
    strace -f -e trace=clone,clone3,fork,vfork,execve,openat -o "$BUILD_STRACE" \
        timeout 300 \
        su agent -s /bin/bash -c \
            "env -i PATH='$AGENT_PATH' HOME=/home/agent TMPDIR=/tmp LC_ALL=C gcc -O2 -Wall -std=c11 -o '$MD2HTML' /app/workspace/*.c -lm" \
        > "$VERIFIER_DIR/gcc.log" 2>&1
    tail -20 "$VERIFIER_DIR/gcc.log"
fi

if reward_tamper_in "$BUILD_STRACE"; then
    fail_with "reward_file_manipulation"
fi

if [ ! -x "$MD2HTML" ]; then
    fail_with "compilation_failed"
fi

# Verify it is an ELF binary, not a script masquerading as the converter.
if [ "$ORACLE_DETECTED" -eq 0 ]; then
    if file "$MD2HTML" 2>/dev/null | grep -qiE '(shell script|ascii text|python script|perl script)'; then
        fail_with "cheat_detected"
    fi
fi
echo "Build OK: $MD2HTML"
echo ""

# ------------------------------------------------------------------
# Stage correctness inputs (root). One python pass writes agent-readable input
# files + ROOT-owned 0666 per-case output files, plus the run/grade manifests.
# ------------------------------------------------------------------
echo "=== Correctness (as agent, under strace) ==="
INPUTS_DIR="$(mktemp -d /tmp/md_inputs_XXXXXXXX)"
OUTPUTS_DIR="$(mktemp -d /tmp/md_outputs_XXXXXXXX)"
chmod 755 "$INPUTS_DIR" "$OUTPUTS_DIR"
RUN_MANIFEST="$INPUTS_DIR/run_manifest.tsv"
GRADE_MANIFEST="$VERIFIER_DIR/grade_manifest.tsv"

STAGE_COUNTS="$(python3 -ISs "$TESTS_DIR/harness.py" stage \
    --visible-dir /tests/visible_cases \
    --hidden-dir /tests/hidden_cases \
    --inputs-dir "$INPUTS_DIR" \
    --outputs-dir "$OUTPUTS_DIR" \
    --run-manifest "$RUN_MANIFEST" \
    --grade-manifest "$GRADE_MANIFEST")"
stage_rc=$?
if [ "$stage_rc" -ne 0 ] || [ ! -s "$RUN_MANIFEST" ]; then
    fail_with "staging_failed"
fi
echo "Staged cases (visible hidden): $STAGE_COUNTS"

# Runner script: pure-bash loop, run AS agent. It only execs md2html (+timeout),
# so any cmark/pandoc/python execve in this log is the converter cheating.
RUNNER="/tmp/md_runner_$$.sh"
cat > "$RUNNER" <<RUNNER_EOF
#!/bin/bash
while IFS=\$'\t' read -r inp out; do
    [ -n "\$inp" ] || continue
    /usr/bin/timeout 10 "$MD2HTML" < "\$inp" > "\$out" 2>/dev/null
done < "$RUN_MANIFEST"
RUNNER_EOF
chmod 755 "$RUNNER"

CORR_STRACE="$VERIFIER_DIR/correctness.strace.log"
timeout 480 \
    strace -f -e trace=clone,clone3,fork,vfork,execve,openat -o "$CORR_STRACE" \
        su agent -s /bin/bash -c \
            "env -i PATH='$AGENT_PATH' HOME=/home/agent TMPDIR=/tmp LC_ALL=C bash '$RUNNER'"

# strace -f guarantees every descendant is dead here.
if reward_tamper_in "$CORR_STRACE"; then
    fail_with "reward_file_manipulation"
fi
if [ "$ORACLE_DETECTED" -eq 0 ] && converter_execve_in "$CORR_STRACE"; then
    fail_with "external_converter_execve"
fi

# Grade as root (reads answer keys + FD-pinned agent outputs). OUTSIDE strace.
GRADE_OUT="$(python3 -ISs "$TESTS_DIR/harness.py" grade \
    --grade-manifest "$GRADE_MANIFEST" \
    --failed-file "$VERIFIER_DIR/failed_cases.txt")"
read -r VIS_PASS VIS_TOTAL HID_PASS HID_TOTAL <<< "$GRADE_OUT"
VIS_PASS=${VIS_PASS:-0}; VIS_TOTAL=${VIS_TOTAL:-0}
HID_PASS=${HID_PASS:-0}; HID_TOTAL=${HID_TOTAL:-0}
CORRECT_PASSED=$((VIS_PASS + HID_PASS))
CORRECT_TOTAL=$((VIS_TOTAL + HID_TOTAL))
echo "  visible:  $VIS_PASS / $VIS_TOTAL"
echo "  hidden:   $HID_PASS / $HID_TOTAL"
echo "  subtotal: $CORRECT_PASSED / $CORRECT_TOTAL"
echo ""

# ------------------------------------------------------------------
# Performance benchmarks. cmark reference runs as ROOT (root-only binary) and is
# NOT traced — so its execve never pollutes the converter tripwire. The agent's
# md2html runs AS agent, under strace, median-of-3.
# ------------------------------------------------------------------
echo "=== Performance Benchmarks ==="
PERF_TOTAL=0
PERF_SCORE_SUM="0.0"
PERF_STRACE_DIR="$VERIFIER_DIR/perf_strace"
mkdir -p "$PERF_STRACE_DIR"
PERF_INPUTS="$(mktemp -d /tmp/md_perf_XXXXXXXX)"
chmod 755 "$PERF_INPUTS"
cp /tests/perf_data/perf_*.md "$PERF_INPUTS"/ 2>/dev/null || true
chmod 644 "$PERF_INPUTS"/*.md 2>/dev/null || true

if [ ! -x "$CMARK" ]; then
    echo "WARNING: cmark reference missing at $CMARK — skipping performance."
else
    for perf_file in "$PERF_INPUTS"/perf_*.md; do
        [ -f "$perf_file" ] || continue
        perf_name="$(basename "$perf_file" .md)"
        PERF_TOTAL=$((PERF_TOTAL + 1))
        file_kb=$(( $(wc -c < "$perf_file") / 1024 ))
        echo "  Benchmark: $perf_name (${file_kb} KB)"

        # cmark reference median-of-3 (root, untraced).
        c1=$(date +%s%N); "$CMARK" --unsafe < "$perf_file" > /dev/null 2>&1; c1e=$(date +%s%N)
        c2=$(date +%s%N); "$CMARK" --unsafe < "$perf_file" > /dev/null 2>&1; c2e=$(date +%s%N)
        c3=$(date +%s%N); "$CMARK" --unsafe < "$perf_file" > /dev/null 2>&1; c3e=$(date +%s%N)
        cmark_median=$(python3 -c "
t=sorted([($c1e-$c1)/1e9,($c2e-$c2)/1e9,($c3e-$c3)/1e9]); print(f'{t[1]:.6f}')")

        # Agent md2html median-of-3 (as agent, UNTRACED). Timing the untraced
        # runs keeps the measurement about the converter rather than ptrace
        # overhead; security comes from the separate traced run below.
        agent_ok=1
        a_times=()
        for run in 1 2 3; do
            s=$(date +%s%N)
            if timeout 60 \
                    su agent -s /bin/bash -c \
                        "env -i PATH='$AGENT_PATH' HOME=/home/agent TMPDIR=/tmp LC_ALL=C '$MD2HTML' < '$perf_file' > /dev/null 2>&1"; then
                e=$(date +%s%N)
                a_times+=("$(python3 -c "print(f'{($e-$s)/1e9:.6f}')")")
            else
                agent_ok=0
                break
            fi
        done

        # One TRACED run (untimed, as agent) feeding the converter/reward-file
        # tripwires. A converter that exec()s cmark/python for speed does so on
        # every run, so a single traced run catches it.
        plog="$PERF_STRACE_DIR/${perf_name}.strace.log"
        timeout 60 \
            strace -f -e trace=clone,clone3,fork,vfork,execve,openat -o "$plog" \
                su agent -s /bin/bash -c \
                    "env -i PATH='$AGENT_PATH' HOME=/home/agent TMPDIR=/tmp LC_ALL=C '$MD2HTML' < '$perf_file' > /dev/null 2>&1" \
            >/dev/null 2>&1 || true
        if reward_tamper_in "$plog"; then
            fail_with "reward_file_manipulation"
        fi
        if [ "$ORACLE_DETECTED" -eq 0 ] && converter_execve_in "$plog"; then
            fail_with "external_converter_execve"
        fi

        if [ "$agent_ok" -eq 1 ] && [ "${#a_times[@]}" -eq 3 ]; then
            agent_median=$(python3 -c "
t=sorted([float(x) for x in '${a_times[0]},${a_times[1]},${a_times[2]}'.split(',')]); print(f'{t[1]:.6f}')")
            test_score=$(python3 -c "
c=max($cmark_median,0.0001); a=max($agent_median,0.0001); print(f'{min(1.0,(c*5.0)/a):.4f}')")
            PERF_SCORE_SUM=$(python3 -c "print(round($PERF_SCORE_SUM + $test_score, 4))")
            echo "    cmark: ${cmark_median}s, agent: ${agent_median}s, score: ${test_score}"
        else
            echo "    agent TIMEOUT/CRASH on $perf_name, score: 0.0"
        fi
    done
fi
echo ""

# ------------------------------------------------------------------
# Compute reward (root, OUTSIDE strace, counters only).
# ------------------------------------------------------------------
echo "=========================================="
echo "  Verifier Results"
echo "=========================================="
python3 -ISs "$TESTS_DIR/compute_reward.py" \
    --output-dir "$VERIFIER_DIR" \
    --correctness-passed "$CORRECT_PASSED" \
    --correctness-total "$CORRECT_TOTAL" \
    --perf-total "$PERF_TOTAL" \
    --perf-score-sum "$PERF_SCORE_SUM" \
    --total-time-s "$((SECONDS - START_S))" \
    --failed-cases-file "$VERIFIER_DIR/failed_cases.txt"

# Human-readable failed-case listing for the log.
if [ -s "$VERIFIER_DIR/failed_cases.txt" ]; then
    echo ""
    echo "Failed/Error cases (first 50):"
    count=0
    while IFS= read -r c; do
        [ -n "$c" ] || continue
        echo "  - $c"
        count=$((count + 1))
        [ "$count" -ge 50 ] && break
    done < "$VERIFIER_DIR/failed_cases.txt"
fi

cleanup_staging
relax_reward_perms

echo ""
echo "End time: $(date)"
echo "========================================"
exit 0
