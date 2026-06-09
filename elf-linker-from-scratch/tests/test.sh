#!/bin/bash
# Verifier entry point — privilege-separated grading (HARBOR_GUIDE §3/§5,
# anti_cheats.md §3-§4, sorbet/align_base_c reference verifiers).
#
# The whole script runs as ROOT (Harbor's verifier user). It NEVER re-execs its
# own body as root with agent code in the loop. Instead:
#
#   * AGENT phase  — build the agent's `myld`, link every tier with it, and run
#                    the produced ELFs, all as the `agent` user under strace
#                    (su agent -c 'env -i …'). Agent code therefore drops
#                    privilege and is confined by /tests mode-700 + /logs/verifier
#                    mode-700. It only ever produces stdout/exit + ELF artifacts
#                    into an agent-owned tmp dir.
#   * ROOT  phase  — read the agent's per-case stdout/exit + ELF artifacts, run
#                    the root-owned reference `.ref` binaries, diff/readelf, and
#                    WRITE THE SCOREBOARD (/logs/verifier/test_results.json).
#                    No agent code runs here, so a malicious myld/ELF cannot mark
#                    itself all-pass: the scoreboard lives at a root-only path the
#                    agent uid can't open, and only this root phase writes it.
#
# Always exits 0 — the outcome is encoded in /logs/verifier/reward.{json,txt}.

VERIFIER_DIR=/logs/verifier
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
REFDATA=/tests/refdata                         # root-only: pristine .o/.a + .ref
RESULTS="$VERIFIER_DIR/test_results.json"       # root-only scoreboard
MUSL=/usr/lib/x86_64-linux-musl
AGENT_PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# ════════════════════════════════════════════════════════════════════════
# PHASE 1 PROLOGUE (root). No `set -euo pipefail` — an early abort must not
# leave the verifier without a reward file. Use `|| fail_with` on critical steps.
# ════════════════════════════════════════════════════════════════════════

# --- MANDATORY: lock + wipe /logs/verifier (root-only) FIRST of all ---
# Harbor sets it 0777 at container start; lock first (immediately cuts off any
# agent background writer), then wipe anything the agent may have planted.
mkdir -p "$VERIFIER_DIR"
chmod 700 "$VERIFIER_DIR"
rm -rf "${VERIFIER_DIR:?}"/*
mkdir -p "$VERIFIER_DIR/strace" "$VERIFIER_DIR/expected"

# Harbor reward bridge: guarantee a reward file exists even on early exit. The
# success path below overwrites it with the real tiered score.
trap 'rc=$?; [ -f /logs/verifier/reward.txt ] || echo 0 > /logs/verifier/reward.txt' EXIT

# --- MANDATORY: /tests lockdown (Harbor's verify-upload resets /tests to 0755) ---
chmod 700 /tests
chmod -R go-rwx "$REFDATA" 2>/dev/null || true

# --- MANDATORY: environment sanitisation (strip injection/preload side channels) ---
unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME BASH_ENV ENV CFLAGS CC CXX MAKEFLAGS

# Restore exec bits (Modal/Daytona drop them; harmless locally).
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

fail_with() {
    local err="$1"
    python3 -ISs "$TESTS_DIR/compute_reward.py" --fail "$err" --output-dir "$VERIFIER_DIR"
    echo "FAIL: $err"
    exit 0
}

# --- MANDATORY: kill pre-existing agent processes (cross-phase isolation) ---
pkill -9 -u agent 2>/dev/null || true
sleep 0.5
if pgrep -u agent >/dev/null 2>&1; then
    sleep 1; pkill -9 -u agent 2>/dev/null || true; sleep 0.5
    pgrep -u agent >/dev/null 2>&1 && fail_with agent_processes_survived
fi

# ════════════════════════════════════════════════════════════════════════
# Staging (root). Stage pristine, ROOT-OWNED .o/.a inputs to an agent-readable
# tmp dir so the agent's myld can link them but cannot swap them; the agent only
# gets a write-able OUTDIR for its produced ELFs/output. The .ref answer binaries
# stay in root-only /tests/refdata and are NEVER staged to the agent.
# ════════════════════════════════════════════════════════════════════════
STAGE="$(mktemp -d /tmp/elf_stage_XXXXXXXX)" || fail_with stage_mktemp_failed
OUTDIR="$STAGE/out"
mkdir -p "$OUTDIR"
cp "$REFDATA"/*.o "$REFDATA"/*.a "$STAGE"/ 2>/dev/null
chown -R root:root "$STAGE"          # inputs immutable to the agent uid
chmod 755 "$STAGE"
chmod 644 "$STAGE"/*.o "$STAGE"/*.a 2>/dev/null
chown agent:agent "$OUTDIR"          # agent writes ONLY here
chmod 755 "$OUTDIR"

MYLD=/app/myld

# Agent-side link+run helper (runs as the agent uid, under strace). It writes
# ONLY into the agent-owned OUTDIR and never touches the scoreboard.
RUNNER="$STAGE/elf_linkrun.sh"
cat > "$RUNNER" <<'RUNNER_EOF'
#!/bin/bash
# args: OUTDIR NAME MODE MYLD -- objs...
OUTDIR="$1"; NAME="$2"; MODE="$3"; MYLD="$4"; shift 4
"$MYLD" -o "$OUTDIR/$NAME.elf" "$@" 2>"$OUTDIR/$NAME.linkerr"
echo "$?" > "$OUTDIR/$NAME.linkrc"
if [ "$MODE" = run ]; then
    [ -x "$OUTDIR/$NAME.elf" ] || chmod +x "$OUTDIR/$NAME.elf" 2>/dev/null
    if [ -f "$OUTDIR/$NAME.elf" ]; then
        timeout 10 "$OUTDIR/$NAME.elf" >"$OUTDIR/$NAME.actual" 2>&1
        echo "$?" >>"$OUTDIR/$NAME.actual"
    fi
fi
exit 0
RUNNER_EOF
chmod 755 "$RUNNER"

REWARD_TAMPER=0

# strace + privilege-drop one link/run job as the agent uid. The strace -f fence
# blocks until every agent descendant exits, so no forked daemon can outlive the
# job and race the root grading phase.
agent_link_run() {
    local name="$1" mode="$2"; shift 2
    local objs="$*"
    local slog="$VERIFIER_DIR/strace/${name}.log"
    pkill -9 -u agent 2>/dev/null || true
    strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
        -o "$slog" \
        timeout 60 \
        su agent -s /bin/bash -c \
        "env -i PATH=$AGENT_PATH HOME=/home/agent TMPDIR=/tmp bash '$RUNNER' '$OUTDIR' '$name' '$mode' '$MYLD' $objs" \
        >/dev/null 2>&1
    if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' "$slog" 2>/dev/null; then
        REWARD_TAMPER=1
    fi
}

# ════════════════════════════════════════════════════════════════════════
# AGENT PHASE — build myld + link/run every tier as the agent uid under strace.
# ════════════════════════════════════════════════════════════════════════
echo "=== Building agent linker (as agent, under strace) ==="
pkill -9 -u agent 2>/dev/null || true
strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
    -o "$VERIFIER_DIR/strace/build.log" \
    timeout 120 \
    su agent -s /bin/bash -c \
    "env -i PATH=$AGENT_PATH HOME=/home/agent TMPDIR=/tmp bash -c 'make -C /app clean >/dev/null 2>&1; make -C /app'" \
    > "$VERIFIER_DIR/build.log" 2>&1
if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
    "$VERIFIER_DIR/strace/build.log" 2>/dev/null; then
    REWARD_TAMPER=1
fi

if [ "$REWARD_TAMPER" -eq 1 ]; then
    rm -rf "${STAGE:?}"
    fail_with reward_file_manipulation
fi

if [ ! -x "$MYLD" ]; then
    echo "myld not found/executable after build"
    cat "$VERIFIER_DIR/build.log"
    rm -rf "${STAGE:?}"
    fail_with build_failed
fi

echo "=== Linking + running tiers (as agent, under strace) ==="
# no-libc tiers (link with agent's myld, execute, capture stdout+exit)
agent_link_run t1_t1_exit   run "$STAGE/t1_exit.o"
agent_link_run t2_t2_hello  run "$STAGE/start.o $STAGE/syscalls.o $STAGE/t2_hello.o"
agent_link_run t2_t2_data   run "$STAGE/start.o $STAGE/syscalls.o $STAGE/t2_data.o"
agent_link_run t3_t3_bss    run "$STAGE/start.o $STAGE/syscalls.o $STAGE/t3_bss.o"
agent_link_run t3_t3_archive run "$STAGE/start.o $STAGE/syscalls.o $STAGE/t3_multi_b.o $STAGE/t3_archive.a"

# structural-only links (readelf-checked, not executed for output)
agent_link_run t4_entry     link "$STAGE/t4_entry.o"
agent_link_run t4_sections  link "$STAGE/t4_sections.o"

# musl-libc tiers (crt1 crti [objs] libc crtn)
agent_link_run t4_hello_libc run "$MUSL/crt1.o $MUSL/crti.o $STAGE/t4_hello_libc.o $MUSL/libc.a $MUSL/crtn.o"
agent_link_run t5_printf     run "$MUSL/crt1.o $MUSL/crti.o $STAGE/t5_printf.o $MUSL/libc.a $MUSL/crtn.o"
agent_link_run t5_multi      run "$MUSL/crt1.o $MUSL/crti.o $STAGE/t5_multi_main.o $STAGE/t5_multi_math.o $MUSL/libc.a $MUSL/crtn.o"
agent_link_run t5_common     run "$MUSL/crt1.o $MUSL/crti.o $STAGE/t5_common_a.o $STAGE/t5_common_b.o $MUSL/libc.a $MUSL/crtn.o"

# Final isolation barrier before any grading touches agent artifacts.
pkill -9 -u agent 2>/dev/null || true

if [ "$REWARD_TAMPER" -eq 1 ]; then
    rm -rf "${STAGE:?}"
    fail_with reward_file_manipulation
fi

# ════════════════════════════════════════════════════════════════════════
# ROOT GRADING PHASE — no agent code runs here. Root reads agent artifacts +
# runs the root-owned references, then writes the unforgeable scoreboard.
# ════════════════════════════════════════════════════════════════════════
PASS=0
FAIL=0
RESULT_KEYS=()
RESULT_VALS=()

record() {           # $1=key  $2=pass|fail
    RESULT_KEYS+=("$1"); RESULT_VALS+=("$2")
    if [ "$2" = pass ]; then PASS=$((PASS+1)); echo "  PASS  $1"; else FAIL=$((FAIL+1)); echo "  FAIL  $1"; fi
}

# Link-with-agent + execute + diff against the root-owned reference output.
grade_run() {        # $1=key  $2=ref-basename
    local key="$1" ref="$2"
    local act="$OUTDIR/${key}.actual"
    local exp="$VERIFIER_DIR/expected/${key}.expected"
    if [ -L "$act" ] || [ ! -f "$act" ]; then record "$key" fail; return; fi
    timeout 10 "$REFDATA/${ref}.ref" > "$exp" 2>&1
    echo "$?" >> "$exp"
    if diff -q "$exp" "$act" >/dev/null 2>&1; then record "$key" pass; else record "$key" fail; fi
}

# Structural readelf gate on an agent-produced ELF.
grade_check_elf() {  # $1=key  $2=elf-basename (in OUTDIR)
    local key="$1" elf="$OUTDIR/$2"
    if [ -L "$elf" ] || [ ! -f "$elf" ]; then record "$key" fail; return; fi
    local t m e loads
    t=$(readelf -h "$elf" 2>/dev/null | grep "Type:" | awk '{print $2}')
    if [ "$t" != "EXEC" ]; then record "$key" fail; return; fi
    m=$(readelf -h "$elf" 2>/dev/null | grep "Machine:" | sed 's/.*: *//')
    if ! echo "$m" | grep -qi "x86.64\|X86-64\|Advanced Micro"; then record "$key" fail; return; fi
    e=$(readelf -h "$elf" 2>/dev/null | grep "Entry point" | awk '{print $NF}')
    if [ "$e" = "0x0" ] || [ -z "$e" ]; then record "$key" fail; return; fi
    loads=$(readelf -l "$elf" 2>/dev/null | grep -c "LOAD")
    if [ "${loads:-0}" -lt 1 ]; then record "$key" fail; return; fi
    record "$key" pass
}

echo ""
echo "=== Grading (as root) ==="

# T1
grade_run      t1_t1_exit      t1_exit
grade_check_elf t1_t1_exit_elf t1_t1_exit.elf

# T2
grade_run      t2_t2_hello     t2_hello
grade_run      t2_t2_data      t2_data
grade_check_elf t2_t2_hello_elf t2_t2_hello.elf

# T3
grade_run      t3_t3_bss       t3_bss
grade_run      t3_t3_archive   t3_archive

# T4 — entry point (adapted from mold entry.sh): pass if entry is nonzero
elf="$OUTDIR/t4_entry.elf"
if [ -f "$elf" ] && [ ! -L "$elf" ]; then
    entry_addr=$(readelf -h "$elf" 2>/dev/null | grep "Entry point" | awk '{print $NF}')
    if [ -n "$entry_addr" ] && [ "$entry_addr" != "0x0" ]; then record t4_entry pass; else record t4_entry fail; fi
else
    record t4_entry fail
fi

# T4 — section merge (adapted from mold section-name.sh): .text present
elf="$OUTDIR/t4_sections.elf"
if [ -f "$elf" ] && [ ! -L "$elf" ]; then
    has_text=$(readelf -S "$elf" 2>/dev/null | grep -c '\.text')
    if [ "${has_text:-0}" -ge 1 ]; then record t4_sections pass; else record t4_sections fail; fi
else
    record t4_sections fail
fi

# T4 — nostdlib structural (adapted from mold nostdlib.sh): no .dynsym/.dynstr
elf="$OUTDIR/t4_entry.elf"
if [ -f "$elf" ] && [ ! -L "$elf" ]; then
    if readelf -S "$elf" 2>/dev/null | grep -q '\.dynsym\|\.dynstr'; then record t4_nostdlib fail; else record t4_nostdlib pass; fi
else
    record t4_nostdlib fail
fi

# T4 — musl hello
grade_run      t4_hello_libc   t4_hello_libc

# T5
grade_run      t5_printf       t5_printf
grade_run      t5_multi        t5_multi
grade_run      t5_common       t5_common

# ── Emit the scoreboard (root-only path; only this root phase writes it) ──
{
    echo "{"
    echo '  "tests": {'
    last=$(( ${#RESULT_KEYS[@]} - 1 ))
    for i in "${!RESULT_KEYS[@]}"; do
        sep=","; [ "$i" -eq "$last" ] && sep=""
        printf '    "%s": "%s"%s\n' "${RESULT_KEYS[$i]}" "${RESULT_VALS[$i]}" "$sep"
    done
    echo "  },"
    echo "  \"summary\": { \"pass\": $PASS, \"fail\": $FAIL, \"total\": $((PASS+FAIL)) }"
    echo "}"
} > "$RESULTS"

rm -rf "${STAGE:?}"

echo ""
echo "=== Results: $PASS passed, $FAIL failed, $((PASS+FAIL)) total ==="
echo ""

# === Compute reward (OUTSIDE strace, as root — no agent code runs here) ===
echo "=== Compute reward ==="
python3 -ISs "$TESTS_DIR/compute_reward.py" --output-dir "$VERIFIER_DIR"

exit 0
