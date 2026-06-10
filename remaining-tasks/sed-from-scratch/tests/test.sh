#!/bin/bash
# Verifier entry point — golden/actual split with privilege drop.
#
#   PROLOGUE (root): lock+wipe /logs/verifier, re-lock /tests (Harbor's verify
#       upload resets it to 0755), sanitise env, SIGKILL any agent processes.
#   GOLD pass (root, NOT under strace): run the correctness suite with the live
#       /usr/bin/sed oracle, stashing every expected output in a root-only mktemp
#       dir the agent can't read.
#   BUILD pass (su agent, env -i, under its OWN strace -f): compile mysed.c and
#       stop. `make` legitimately exec's the compiler toolchain (cc/gcc/as/ld/
#       collect2…), so this log is NEVER scanned for the forbid-external-exec
#       tripwire.
#   RUN pass (su agent, env -i, under a SEPARATE strace -f): run the already-built
#       agent binary over the same suite, writing outputs to an agent-writable
#       dir. The agent runs as a non-root UID so /tests 0700 blocks the golden
#       .good files. This isolated run log feeds two execve tripwires: the real
#       sed regex AND a forbid-external-exec allow-set — a from-scratch mysed must
#       never exec any program but itself, so exec'ing a copied real sed (e.g.
#       /tmp/x) zeroes the reward.
#   SCORING (root, OUTSIDE strace): compare GOLD vs the agent's outputs to build
#       test_results.txt, then compute_reward.py — no agent code runs here.
#
# No `set -euo pipefail`: an early abort can leave the reward file unwritten.

LOGDIR=/logs/verifier
TESTS_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS="$LOGDIR/test_results.txt"
# Build and run are straced into SEPARATE logs: the build log holds the compiler
# toolchain's legitimate execs (never tripwire-scanned); the run log holds only
# the mysed execution and is scanned for forbidden external execs.
BUILD_STRACE_LOG="$LOGDIR/strace.build.log"
RUN_STRACE_LOG="$LOGDIR/strace.run.log"
AGENT_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Oracle bypass: solve.sh writes HARBOR_ORACLE_FLAG (injected only into oracle
# runs via [solution.env]) to ORACLE_MARKER. The agent owns /app and can create
# the marker, but never sees the token, so it cannot forge the contents. Keep in
# sync with task.toml [solution.env] and compute_reward.py ORACLE_FLAG.
ORACLE_MARKER="/app/.harbor_oracle_marker"
EXPECTED_ORACLE_FLAG="sed_from_scratch_882886efd1ebeec5"

GOLD=""
STAGE=""
cleanup() {
    [ -n "$GOLD" ] && rm -rf "$GOLD" 2>/dev/null
    [ -n "$STAGE" ] && rm -rf "$STAGE" 2>/dev/null
    return 0
}

# Relax /logs/verifier so a local-Docker host reader (the bind mount preserves
# the in-container 0700 dir + 0600 mkstemp reward files, which lock out a
# non-root host uid) can read the reward. Safe — verification is complete and
# all agent processes are dead (strace fence + pre-kill). A verify-retry
# re-locks via the lock+wipe prologue.
relax_reward() {
    chmod 755 "$LOGDIR" 2>/dev/null || true
    chmod 644 "$LOGDIR"/reward.json "$LOGDIR"/reward.txt 2>/dev/null || true
}

fail_with() {
    local reason="$1"
    python3 -ISs "$TESTS_DIR/compute_reward.py" --fail "$reason"
    echo "FAIL: $reason"
    relax_reward
    cleanup
    exit 0
}

# Allow-set for execve during the mysed RUN strace. A pure-C from-scratch mysed
# never spawns a program, so the only legitimate execs in the run log are:
#   * /app/mysed itself (the deliverable under test), and
#   * the harness wrapper chain + the correctness suite's helper utilities, all
#     of which live in a root-owned system bin dir.
# Every allowed helper must resolve inside a system bin dir (the agent UID can
# never write there), so an agent-supplied binary in /tmp, /app, /home, /dev/shm,
# … can NEVER satisfy this — that is what catches `cp /usr/bin/sed /tmp/x; exec
# /tmp/x`. The basename list below must stay in sync with run_suite.sh's
# run-phase helpers (mkdir/cp/tr/cat/seq/head) plus the privilege-drop wrapper
# chain (timeout -> su -> bash -> env, and su's PAM helper unix_chkpwd). It is
# deliberately a closed set (NOT "any system binary"), so a mysed that exec's an
# interpreter such as perl/awk/python to emulate sed is still flagged.
run_exec_allowed() {
    local path="$1" dir base
    [ "$path" = "/app/mysed" ] && return 0
    dir="${path%/*}"
    base="${path##*/}"
    case "$dir" in
        /bin|/usr/bin|/sbin|/usr/sbin|/usr/local/bin|/usr/local/sbin) ;;
        *) return 1 ;;
    esac
    case "$base" in
        su|env|bash|sh|dash|timeout|unix_chkpwd) return 0 ;;
        mkdir|tr|cp|cat|seq|head) return 0 ;;
    esac
    return 1
}

# === MANDATORY: lock + wipe /logs/verifier (root-only) before agent code ===
mkdir -p "$LOGDIR"
chmod 700 "$LOGDIR"
rm -rf "${LOGDIR:?}"/*

# === MANDATORY: re-lock /tests ===
# Harbor's verify-phase upload of test.sh resets /tests back to mode 0755,
# undoing the Dockerfile's `chmod 700 /tests`. Re-apply here, first thing, so
# the agent UID gets EACCES on /tests/gnu_suite/*.good during the agent pass.
chmod 700 /tests

# === MANDATORY: environment sanitisation (before any su / build) ===
unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME BASH_ENV ENV
unset CFLAGS CC CXX MAKEFLAGS

# Restore exec bits (Modal/Daytona drop them; harmless locally). -type f only,
# so it does not undo the /tests dir chmod above.
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

# === MANDATORY: kill any agent processes left over from the agent phase ===
pkill -9 -u agent 2>/dev/null || true
sleep 0.5
if pgrep -u agent >/dev/null 2>&1; then
    sleep 1
    pkill -9 -u agent 2>/dev/null || true
    sleep 0.5
    pgrep -u agent >/dev/null 2>&1 && fail_with "agent_processes_survived"
fi

# === Oracle marker detection ===
# The oracle ships a thin /usr/bin/sed wrapper, so its mysed legitimately
# exec's the real sed. Detect the marker (content must match the secret token)
# to skip the execve-sed tripwire for oracle runs only.
ORACLE_DETECTED=0
if [ -f "$ORACLE_MARKER" ] && \
   [ "$(cat "$ORACLE_MARKER" 2>/dev/null)" = "$EXPECTED_ORACLE_FLAG" ]; then
    ORACLE_DETECTED=1
    echo "[oracle] marker detected — execve-sed tripwire disabled for this run"
fi

# === Staging dirs ===
# GOLD: root-only (0700) golden outputs — agent can never read these.
GOLD="$(mktemp -d)"
chmod 700 "$GOLD"
GOLDWORK="$GOLD/work"
mkdir -p "$GOLDWORK"

# STAGE: agent-accessible. gnu/ holds staged .sed/.inp INPUTS (never the .good
# answers); out/ + work/ are agent-writable; run_suite.sh is root-owned r-x.
STAGE="$(mktemp -d)"
GNUSTAGE="$STAGE/gnu"
AOUT="$STAGE/out"
AWORK="$STAGE/work"
mkdir -p "$GNUSTAGE" "$AOUT" "$AWORK"
cp /tests/gnu_suite/*.sed /tests/gnu_suite/*.inp "$GNUSTAGE"/ 2>/dev/null
RUNNER="$STAGE/run_suite.sh"
cp "$TESTS_DIR/run_suite.sh" "$RUNNER"
chmod 755 "$RUNNER"
chown -R agent:agent "$AOUT" "$AWORK"
chmod 755 "$STAGE" "$GNUSTAGE"
chmod -R a+rX "$GNUSTAGE"

# === GOLD pass (root, live /usr/bin/sed oracle, NOT under strace) ===
echo "=== Generating golden outputs (root, /usr/bin/sed) ==="
env -i PATH="$AGENT_PATH" HOME=/root TMPDIR=/tmp LC_ALL=C \
    SEDBIN=/usr/bin/sed OUTDIR="$GOLD" GNUSTAGE="$GNUSTAGE" WORKDIR="$GOLDWORK" \
    DO_BUILD=0 bash "$RUNNER"

# === BUILD pass (compile mysed as the agent UID, under its OWN strace -f) ===
# `make` legitimately exec's the compiler toolchain, so this log is NEVER scanned
# for the forbid-external-exec tripwire. BUILD_ONLY=1 stops run_suite.sh right
# after the build, before any mysed runs, keeping compiler execs out of the run
# log.
echo "=== Building mysed (as agent, build strace) ==="
strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
    -o "$BUILD_STRACE_LOG" \
    timeout 600 \
    su agent -s /bin/bash -c "env -i PATH=$AGENT_PATH HOME=/home/agent TMPDIR=/tmp LC_ALL=C SEDBIN=/app/mysed OUTDIR=$AOUT GNUSTAGE=$GNUSTAGE WORKDIR=$AWORK DO_BUILD=1 BUILD_ONLY=1 bash $RUNNER"

cp "$AWORK/compile.log" "$LOGDIR/compile.log" 2>/dev/null || true
[ -f "$AOUT/.build_failed" ] && echo "WARN: mysed build failed (see compile.log)"

# === RUN pass (run the built mysed over the suite, under a SEPARATE strace -f) ===
# Skipped if the build failed (no binary to run; scoring then records every case
# as FAIL). DO_BUILD=0 means run_suite.sh runs the already-built /app/mysed.
if [ ! -f "$AOUT/.build_failed" ]; then
    echo "=== Running mysed over the suite (as agent, run strace) ==="
    strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
        -o "$RUN_STRACE_LOG" \
        timeout 600 \
        su agent -s /bin/bash -c "env -i PATH=$AGENT_PATH HOME=/home/agent TMPDIR=/tmp LC_ALL=C SEDBIN=/app/mysed OUTDIR=$AOUT GNUSTAGE=$GNUSTAGE WORKDIR=$AWORK DO_BUILD=0 bash $RUNNER"
fi

# strace -f guarantees every descendant is dead here.

# === RUN-phase execve tripwires (skipped for oracle) ===
# The oracle ships a thin /usr/bin/sed wrapper, so its mysed legitimately exec's
# the real sed; both run-phase execve tripwires are disabled for verified-oracle
# runs only.
if [ "$ORACLE_DETECTED" -eq 0 ] && [ -f "$RUN_STRACE_LOG" ]; then
    # (1) Defense in depth: explicit exec of the system sed by name/path.
    if grep -Eq 'execve\(.*"(/usr/bin/sed|/bin/sed)"' "$RUN_STRACE_LOG" 2>/dev/null; then
        echo "execve tripwire: agent exec'd the system sed"
        fail_with "cheat_exec_sed"
    fi

    # (2) Forbid ANY external exec during the mysed run. A from-scratch mysed
    #     never spawns a program, so the only legitimate execs are mysed itself
    #     plus the harness wrapper + suite helpers (see run_exec_allowed). Any
    #     other *successful* execve — e.g. exec of a real sed copied to /tmp/x —
    #     means the agent is shelling out to an external oracle: zero the reward.
    #     `= -1` (failed/PATH-probe) execs are ignored; they ran nothing.
    while IFS= read -r line; do
        [ -z "$line" ] && continue
        exe="${line#execve(\"}"
        exe="${exe%\"}"
        run_exec_allowed "$exe" && continue
        echo "run-phase external-exec tripwire: $exe"
        fail_with "cheat_external_exec"
    done < <(
        grep -E 'execve\("' "$RUN_STRACE_LOG" 2>/dev/null \
            | grep -vE '\)[[:space:]]*=[[:space:]]*-1' \
            | grep -oE 'execve\("[^"]+"' \
            | sort -u
    )
fi

# === reward-file tamper tripwire (build + run straces) ===
# Nothing legitimate opens the reward files during either strace window
# (compute_reward.py runs afterwards). Any write-mode open is agent code.
if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
    "$BUILD_STRACE_LOG" "$RUN_STRACE_LOG" 2>/dev/null; then
    fail_with "reward_file_manipulation"
fi

# === Scoring: compare GOLD vs agent outputs (root, OUTSIDE strace) ===
: > "$RESULTS"
shopt -s nullglob
for gf in "$GOLD"/*.out; do
    id="$(basename "$gf" .out)"
    ok=1
    cmp -s "$gf" "$AOUT/$id.out" || ok=0
    if [ -f "$GOLD/$id.b" ]; then
        cmp -s "$GOLD/$id.b" "$AOUT/$id.b" || ok=0
    fi
    if [ -f "$GOLD/$id.rc" ]; then
        [ "$(cat "$GOLD/$id.rc")" = "$(cat "$AOUT/$id.rc" 2>/dev/null)" ] || ok=0
    fi
    if [ "$ok" -eq 1 ]; then
        echo "$id PASS" >> "$RESULTS"
    else
        echo "$id FAIL" >> "$RESULTS"
    fi
done
shopt -u nullglob

# === Compute reward (OUTSIDE strace — no agent code runs here) ===
python3 -ISs "$TESTS_DIR/compute_reward.py" "$RESULTS"

relax_reward
cleanup
exit 0
