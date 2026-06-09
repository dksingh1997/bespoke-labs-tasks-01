#!/bin/bash
# Harbor verifier for the TCC optimization task — hardened (Phases 1 + 2 + 4).
#
# Threat model fixed in this revision:
#   * Previously the MODIFIED tcc build AND every agent-emitted benchmark/test
#     binary ran as ROOT with the verifier's result-dir env exported, so an
#     emitted binary could tamper the already-written baseline results / golden.
#   * The scored heapsort benchmark's OUTPUT was never checked, so a compiler
#     that miscompiled heapsort to be "fast" still scored.
#
# Hardened design:
#   PROLOGUE (root, no agent code): lock+wipe /logs/verifier, re-lock /tests,
#     sanitize env, kill pre-existing agent processes.
#   BASELINE PHASE (root, BEFORE the agent run, root-only outputs): build the
#     pristine baseline TCC, run baseline correctness, and compute the GOLDEN
#     heapsort stdout. The agent cannot read or tamper any of this.
#   AGENT PHASE (under strace -f): build the MODIFIED tcc and run every
#     agent-emitted binary AS the `agent` user via `su agent -c 'env -i ...'`.
#     Result/golden dirs are NOT exported into the agent env. The trusted
#     baseline binary is timed as root, interleaved with the agent binary, so
#     drift cancels but agent code never runs as root and cannot touch the
#     root-only timing CSV.
#   SCORING (root, OUTSIDE strace): output-validation gate (modified heapsort
#     stdout must byte-match the golden) + speedup, via `python3 -ISs`, atomic.
#
# Always exits 0 — the outcome is in /logs/verifier/reward.{json,txt}.

set -o pipefail

# === Configuration ===
TCC_BOOTSTRAP="/usr/local/bin/tcc-bootstrap"
TCC_BOOTSTRAP_FLAGS="-B/usr/local/tcc-bootstrap-full"
TCC_SRC="/app/compiler-src/tcc"
TCC_FLAGS="-B${TCC_SRC}"
VERIFIER_DIR="/logs/verifier"
TESTS_DIR="$(dirname "$(readlink -f "$0")")"
STRACE_LOG="$VERIFIER_DIR/strace.log"
STATUS_FILE="$VERIFIER_DIR/verify_status.txt"

AGENT_USER="agent"
AGENT_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
TIMING_RUNS="${TIMING_RUNS:-5}"          # timed iterations (>=5); +1 warmup discarded
STRACE_TIMEOUT="${STRACE_TIMEOUT:-1200}" # inner bound on the agent phase

# Oracle marker (HARBOR_GUIDE §5). solution/solve.sh writes HARBOR_ORACLE_FLAG
# here on oracle runs only; the agent never sees the token, so it cannot forge
# it. Matching it ONLY relaxes the GCC-presence anti-cheat (the oracle's bundled
# gcc is allowed). Every other gate (run-as-agent, strace reward-tamper scan,
# output-validation vs the golden, correctness regression, speedup) is unchanged.
ORACLE_MARKER="/app/.harbor_oracle_marker"
EXPECTED_ORACLE_FLAG="tcc-heapsort-814c546f3a3fde6a"  # must match [solution.env] in task.toml

# Root-only working dirs (agent cannot read or write):
ROOT_DIR="/tmp/harbor_verifier_root"
# Read-only sources for the agent (root-owned, world-readable, not writable):
PRISTINE="/tmp/harbor_pristine"
# Agent-owned scratch for the modified build's emitted artifacts:
AGENT_DIR="/tmp/harbor_agent"

# === PHASE 1 PROLOGUE — lock + wipe /logs/verifier (root-only) FIRST ===
# Harbor sets it 777 at container start; lock first (immediately cuts off any
# agent background process), then wipe anything the agent may have planted.
mkdir -p "$VERIFIER_DIR"
chmod 700 "$VERIFIER_DIR"
rm -rf "${VERIFIER_DIR:?}"/*

# Re-lock /tests (root-only) and restore exec bits on helper scripts.
chmod 700 /tests 2>/dev/null || true
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

# Mirror all console output into the verifier log (Harbor downloads it).
LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

# Sanitize environment side-channels before any build runs.
unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME PYTHONSTARTUP \
      BASH_ENV ENV CFLAGS CC CXX MAKEFLAGS NODE_OPTIONS

# Hard-failure helper: scoring stays in compute_reward.py (reason -> additional_data).
fail_with() {
    python3 -ISs "$TESTS_DIR/compute_reward.py" --fail "$1" --output-dir "$VERIFIER_DIR" 2>&1
    # Relax /logs/verifier so a local-docker host (uid 1000) can read the reward.
    chmod 755 "$VERIFIER_DIR" 2>/dev/null || true
    chmod 644 "$VERIFIER_DIR"/reward.json "$VERIFIER_DIR"/reward.txt 2>/dev/null || true
    echo "FAIL: $1"
    exit 0
}

# Kill any pre-existing agent processes (retry; fail if they survive).
pkill -9 -u "$AGENT_USER" 2>/dev/null || true
sleep 0.5
if pgrep -u "$AGENT_USER" >/dev/null 2>&1; then
    sleep 1
    pkill -9 -u "$AGENT_USER" 2>/dev/null || true
    sleep 0.5
    if pgrep -u "$AGENT_USER" >/dev/null 2>&1; then
        fail_with agent_processes_survived
    fi
fi

echo "========================================"
echo "  Harbor TCC Optimization Verifier (hardened)"
echo "  (TCC-Bootstrap Mode - No GCC)"
echo "========================================"
echo "Start time: $(date)"
echo ""

# === Oracle detection (HARBOR_GUIDE §5) ===
# The marker is matched against the unforgeable token. An oracle run extracts a
# bundled gcc (the agent never can: no debs in /solution, no internet, no gcc in
# the image), so for the oracle ONLY we relax the GCC-presence anti-cheat below.
IS_ORACLE=0
ORACLE_ARG=""
if [ -f "$ORACLE_MARKER" ] && [ "$(cat "$ORACLE_MARKER" 2>/dev/null)" = "$EXPECTED_ORACLE_FLAG" ]; then
    IS_ORACLE=1
    ORACLE_ARG="--oracle"
    echo "Oracle run detected (token match) — GCC-presence anti-cheat will be bypassed"
    echo "and the correctness-regression gate is disabled for the oracle (its bundled"
    echo "gcc -O3 legitimately differs from baseline tcc on UB-heavy torture tests)."
    echo ""
fi

# === Step 0: Verify GCC/Clang is NOT present (anti-cheat; no agent code) ===
echo "=== Step 0: Anti-Cheat Verification ==="
is_disallowed_c_compiler() {
    local tool="$1"
    local tool_path resolved version_line
    if ! tool_path="$(command -v "$tool" 2>/dev/null)"; then
        return 1
    fi
    resolved="$(readlink -f "$tool_path" 2>/dev/null || true)"
    if [[ "$tool_path" =~ g\+\+([-.0-9]+)?$ || "$tool_path" =~ gcc([-.0-9]+)?$ || "$tool_path" =~ clang\+\+([-.0-9]+)?$ || "$tool_path" =~ clang([-.0-9]+)?$ ]]; then
        return 0
    fi
    if [[ -n "$resolved" && ( "$resolved" =~ g\+\+([-.0-9]+)?$ || "$resolved" =~ gcc([-.0-9]+)?$ || "$resolved" =~ clang\+\+([-.0-9]+)?$ || "$resolved" =~ clang([-.0-9]+)?$ ) ]]; then
        return 0
    fi
    version_line="$("$tool" --version 2>&1 | head -n 1 | tr '[:upper:]' '[:lower:]')"
    if [[ "$version_line" == *"gcc"* || "$version_line" == *"clang"* || "$version_line" == *"llvm"* ]]; then
        return 0
    fi
    return 1
}

if [ "$IS_ORACLE" -eq 1 ]; then
    echo "✓ Oracle run: GCC-presence check bypassed (token-gated; bundled gcc allowed)"
elif is_disallowed_c_compiler gcc || is_disallowed_c_compiler g++ || is_disallowed_c_compiler clang || is_disallowed_c_compiler clang++ || is_disallowed_c_compiler cc; then
    echo "ERROR: GCC/Clang-family compiler found in environment!"
    fail_with gcc_present
else
    echo "✓ No GCC/Clang-family compiler in environment"
fi
echo "✓ Using TCC bootstrap compiler: $TCC_BOOTSTRAP"
$TCC_BOOTSTRAP --version 2>&1 | head -3
echo ""

# === Working directories ===
rm -rf "$ROOT_DIR" "$PRISTINE" "$AGENT_DIR"
mkdir -p "$ROOT_DIR";    chmod 700 "$ROOT_DIR"
mkdir -p "$PRISTINE";    chmod 755 "$PRISTINE"
mkdir -p "$AGENT_DIR"

# Pristine, read-only copies out of root-only /tests. The agent can read them
# (compile sources, run scripts) but the trees are root-owned, so neither the
# heapsort source nor the correctness scripts can be tampered.
cp -r "$TESTS_DIR/benchmarks" "$PRISTINE/"
cp -r "$TESTS_DIR/scripts"    "$PRISTINE/"
cp -r "$TESTS_DIR/data"       "$PRISTINE/"
chmod -R a+rX "$PRISTINE"

SCRIPTS="$PRISTINE/scripts"
HEAPSORT_SRC="$PRISTINE/benchmarks/llvm-test-suite/SingleSource/Benchmarks/Shootout/heapsort.c"
[[ -f "$HEAPSORT_SRC" ]] || fail_with heapsort_source_missing

# Agent-owned scratch for the modified build's emitted artifacts.
chown -R "$AGENT_USER":"$AGENT_USER" "$AGENT_DIR"
chmod 755 "$AGENT_DIR"

# Small agent-side helper scripts (root-owned, world-readable+exec, NOT writable
# by the agent). Keeping them as files avoids fragile nested su/env -i quoting.
HELPERS="$PRISTINE/helpers"
mkdir -p "$HELPERS"
HELPER_BUILD="$HELPERS/agent_build_tcc.sh"
HELPER_HS="$HELPERS/agent_build_heapsort.sh"

cat > "$HELPER_BUILD" <<'BUILD_EOF'
#!/bin/bash
# args: <tcc_src> <bootstrap_cc> <bootstrap_flags>   (runs as agent, env -i)
set -e
cd "$1"
chmod +x configure 2>/dev/null || true   # transfers can drop the exec bit -> 126
make clean >/dev/null 2>&1 || true
CC="$2" CFLAGS="$3" ./configure
make CC="$2" CFLAGS="$3"
BUILD_EOF

cat > "$HELPER_HS" <<'HS_EOF'
#!/bin/bash
# args: <tcc_bin> <tcc_flags> <heapsort_src> <out_bin> <warmup_stdout>
# Compiles heapsort with the modified compiler and runs it once (warmup, which
# is discarded for timing) capturing stdout for the output-validation gate.
set -e
"$1" -w "$2" "$3" -o "$4" -lm
"$4" > "$5" 2>/dev/null || true
HS_EOF

chmod 755 "$HELPER_BUILD" "$HELPER_HS"

# === BASELINE PHASE (root, BEFORE the agent run; root-only outputs) ===
echo "=== Baseline phase (root-only): build baseline TCC + golden ==="
BASELINE_TCC_READONLY="/tests/baseline-tcc"
BASELINE_TCC_SRC="$ROOT_DIR/baseline-tcc"
BASELINE_TCC_BIN="$BASELINE_TCC_SRC/tcc"
BASELINE_TCC_FLAGS="-B${BASELINE_TCC_SRC}"
BASELINE_CORR_DIR="$ROOT_DIR/correctness_baseline"
BASELINE_HS_BIN="$ROOT_DIR/heapsort_baseline"
GOLDEN_OUT="$ROOT_DIR/golden.out"

[[ -d "$BASELINE_TCC_READONLY" ]] || fail_with no_baseline
cp -r "$BASELINE_TCC_READONLY" "$BASELINE_TCC_SRC"
(
    cd "$BASELINE_TCC_SRC" || exit 1
    chmod +x configure 2>/dev/null || true   # KEEP: baseline-configure chmod fix
    make clean >/dev/null 2>&1 || true
    CC="$TCC_BOOTSTRAP" CFLAGS="$TCC_BOOTSTRAP_FLAGS" ./configure 2>&1 || exit 1
    make CC="$TCC_BOOTSTRAP" CFLAGS="$TCC_BOOTSTRAP_FLAGS" 2>&1 || exit 1
) || fail_with baseline_build_failed
[[ -x "$BASELINE_TCC_BIN" ]] || fail_with baseline_binary_missing
echo "Baseline TCC built."
"$BASELINE_TCC_BIN" --version 2>&1 | head -3

echo "=== Baseline correctness (root) ==="
mkdir -p "$BASELINE_CORR_DIR"
"$SCRIPTS/correctness_tests.sh" \
    --custom "$BASELINE_TCC_BIN" \
    --custom-flags "$BASELINE_TCC_FLAGS" \
    --results-dir "$BASELINE_CORR_DIR" \
    --timeout 10 \
    2>&1 || true
BASELINE_CORR_CSV="$BASELINE_CORR_DIR/results.csv"

echo "=== Golden heapsort output (root, baseline compiler) ==="
"$BASELINE_TCC_BIN" -w "$BASELINE_TCC_FLAGS" "$HEAPSORT_SRC" -o "$BASELINE_HS_BIN" -lm 2>&1 \
    || fail_with baseline_heapsort_compile_failed
"$BASELINE_HS_BIN" > "$GOLDEN_OUT" 2>/dev/null || fail_with baseline_heapsort_run_failed
chmod 600 "$GOLDEN_OUT"
[[ -s "$GOLDEN_OUT" ]] || fail_with golden_output_empty
echo "Golden output: $(cat "$GOLDEN_OUT")"
echo ""

# === AGENT PHASE (under strace) ===
# Generate a root-only orchestration script. It runs as ROOT under strace and
# drops to `agent` (env -i) for every step that touches agent-built code, while
# timing the trusted baseline binary directly as root. Result/golden dirs are
# NOT in the agent env (env -i), so an emitted binary cannot find or tamper them.
MOD_CORR_DIR="$AGENT_DIR/correctness_modified"
MOD_HS_BIN="$AGENT_DIR/heapsort_modified"
MOD_OUT="$AGENT_DIR/modified.out"
TIMING_CSV="$ROOT_DIR/timing.csv"
MOD_CORR_CSV="$ROOT_DIR/modified_correctness.csv"
MOD_OUT_ROOT="$ROOT_DIR/modified.out"
AGENT_PHASE="$ROOT_DIR/agent_phase.sh"

export AGENT_USER AGENT_PATH TCC_BOOTSTRAP TCC_BOOTSTRAP_FLAGS TCC_SRC TCC_FLAGS
export SCRIPTS HEAPSORT_SRC HELPER_BUILD HELPER_HS
export MOD_CORR_DIR MOD_HS_BIN MOD_OUT BASELINE_HS_BIN
export ROOT_DIR TIMING_CSV MOD_CORR_CSV MOD_OUT_ROOT TIMING_RUNS STATUS_FILE

cat > "$AGENT_PHASE" <<'PHASE_EOF'
#!/bin/bash
# Runs as ROOT under strace. Drops to `agent` for all agent-built code.
set -o pipefail
fail() { echo "$1" > "$STATUS_FILE"; echo "AGENT_PHASE_ERROR: $1"; exit 0; }

AGENT_ENV="env -i PATH=$AGENT_PATH HOME=/home/$AGENT_USER TMPDIR=/tmp"
run_agent() { su "$AGENT_USER" -s /bin/bash -c "$AGENT_ENV $*"; }

echo "=== Step A: Build modified TCC (as agent, env -i) ==="
run_agent "bash $HELPER_BUILD $TCC_SRC $TCC_BOOTSTRAP $TCC_BOOTSTRAP_FLAGS" \
    || fail modified_build_failed
[ -x "$TCC_SRC/tcc" ] || fail modified_binary_missing

echo "=== Step A2: Modified TCC sanity (as agent) ==="
run_agent "bash -c 'echo \"int main(){return 0;}\" > /tmp/agent_sanity.c && \
    $TCC_SRC/tcc $TCC_FLAGS /tmp/agent_sanity.c -o /tmp/agent_sanity && \
    /tmp/agent_sanity'" || fail modified_sanity_failed

echo "=== Step B: Modified correctness (as agent) ==="
run_agent "bash $SCRIPTS/correctness_tests.sh \
    --custom $TCC_SRC/tcc --custom-flags $TCC_FLAGS \
    --results-dir $MOD_CORR_DIR --timeout 10" 2>&1 || true
# Capture the modified correctness CSV by reading it AS the agent (a symlink to
# a root-only file is denied -> empty -> missing rows count as regressions).
run_agent "cat $MOD_CORR_DIR/results.csv" > "$MOD_CORR_CSV" 2>/dev/null || true

echo "=== Step C: Compile + capture modified heapsort (as agent) ==="
run_agent "bash $HELPER_HS $TCC_SRC/tcc $TCC_FLAGS $HEAPSORT_SRC $MOD_HS_BIN $MOD_OUT" \
    || fail modified_heapsort_compile_failed
# Capture the modified heapsort stdout AS the agent into a root-only file (a
# symlink to the root-only golden is denied -> empty -> output gate fails).
run_agent "cat $MOD_OUT" > "$MOD_OUT_ROOT" 2>/dev/null || true
[ -s "$MOD_OUT_ROOT" ] || echo "WARNING: modified heapsort produced no stdout"

echo "=== Step D: Interleaved timing (baseline=root, modified=agent) ==="
[ -x "$BASELINE_HS_BIN" ] || fail baseline_heapsort_missing
[ -x "$MOD_HS_BIN" ]      || fail modified_heapsort_missing

PIN="taskset -c 0 nice -n -5"
command -v taskset >/dev/null 2>&1 || PIN="nice -n -5"

time_secs() {  # runs "$@" pinned, prints wall seconds
    local s e
    s=$(date +%s.%N)
    "$@" >/dev/null 2>&1
    e=$(date +%s.%N)
    awk -v a="$s" -v b="$e" 'BEGIN{printf "%.6f", (b-a)}'
}

# Clear any lingering agent process before measuring.
pkill -9 -u "$AGENT_USER" 2>/dev/null || true
sleep 0.3

# Discard several warmup runs (not just one): the heapsort touches a ~64MB array
# and runs right after the heavy strace correctness phase, so the first measured
# iteration is a cold-start outlier (CPU governor ramping, cold caches/THP). A
# single warmup left that outlier in the sample, inflating the baseline-variance
# noise floor. Extra warmups let the machine settle before the timed iterations;
# this only improves measurement accuracy (no gate is weakened).
WARMUP_RUNS="${WARMUP_RUNS:-3}"
echo "iter,baseline_sec,modified_sec" > "$TIMING_CSV"
measured=0
for ((i=0; i<WARMUP_RUNS+TIMING_RUNS; i++)); do
    tb=$(time_secs $PIN "$BASELINE_HS_BIN")
    tm=$(time_secs $PIN su "$AGENT_USER" -s /bin/bash -c "$AGENT_ENV $MOD_HS_BIN")
    # Kill any background process the modified binary may have spawned so it
    # cannot load the CPU during the next baseline measurement (drift attack).
    pkill -9 -u "$AGENT_USER" 2>/dev/null || true
    if [ "$i" -lt "$WARMUP_RUNS" ]; then
        echo "  warmup $((i+1))/$WARMUP_RUNS: baseline=${tb}s modified=${tm}s (discarded)"
        continue
    fi
    measured=$((measured+1))
    echo "  iter $measured: baseline=${tb}s modified=${tm}s"
    echo "$measured,$tb,$tm" >> "$TIMING_CSV"
done

echo ok > "$STATUS_FILE"
PHASE_EOF
chmod 700 "$AGENT_PHASE"

echo "=== Agent phase: build + run modified TCC under strace (as agent) ==="
strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
    -o "$STRACE_LOG" \
    timeout "$STRACE_TIMEOUT" \
    bash "$AGENT_PHASE"

echo ""
echo "Strace block finished (all agent descendants have exited)."
echo ""

# === Anti-cheat: scan strace for reward-file tampering (KEEP) ===
# Nothing legitimate writes reward.{txt,json} during the strace window. Any
# write-mode open of those files is agent code manipulating the reward.
if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
    "$STRACE_LOG" 2>/dev/null; then
    echo "DETECTED: reward-file write during straced agent execution"
    fail_with reward_file_manipulation
fi

# === Handle hard build/setup failures (reward 0.0; reason in additional_data) ===
STATUS="$(cat "$STATUS_FILE" 2>/dev/null)"
[[ -z "$STATUS" ]] && STATUS="incomplete_verification"
if [[ "$STATUS" != "ok" ]]; then
    echo "Verification did not complete cleanly: $STATUS"
    fail_with "$STATUS"
fi

echo "Baseline correctness CSV: $BASELINE_CORR_CSV"
echo "Modified correctness CSV: $MOD_CORR_CSV"
echo "Timing CSV:               $TIMING_CSV"
echo "Golden output:            $GOLDEN_OUT"
echo "Modified output:          $MOD_OUT_ROOT"
echo ""

# === Scoring (root, OUTSIDE strace — no agent code runs here) ===
echo "=== Computing Reward (output gate + speedup) ==="
python3 -ISs "$TESTS_DIR/compute_reward.py" \
    --baseline-correctness-csv "$BASELINE_CORR_CSV" \
    --modified-correctness-csv "$MOD_CORR_CSV" \
    --timing-csv "$TIMING_CSV" \
    --golden-output "$GOLDEN_OUT" \
    --modified-output "$MOD_OUT_ROOT" \
    --output-dir "$VERIFIER_DIR" \
    ${ORACLE_ARG:-} \
    2>&1

echo ""
echo "End time: $(date)"
echo "========================================"

# === Verify reward files exist (fallback if scoring produced nothing) ===
if [[ -f "$VERIFIER_DIR/reward.json" ]]; then
    echo "✓ reward.json written successfully"
    cat "$VERIFIER_DIR/reward.json"
else
    echo "ERROR: reward.json not found, writing fallback"
    python3 -ISs "$TESTS_DIR/compute_reward.py" --fail reward_computation_failed --output-dir "$VERIFIER_DIR" 2>&1 || {
        echo '{"score": 0.0, "reward": 0.0, "subscores": [], "additional_data": {"error": "reward_computation_failed"}}' > "$VERIFIER_DIR/reward.json"
        echo "0.0" > "$VERIFIER_DIR/reward.txt"
    }
fi

# Relax /logs/verifier so a local-docker host (uid 1000) can read the reward
# files (bind mount preserves in-container 0700/0600). Safe: verification is
# complete and every agent process is dead (strace fence + pre-kill).
chmod 755 "$VERIFIER_DIR" 2>/dev/null || true
chmod 644 "$VERIFIER_DIR"/reward.json "$VERIFIER_DIR"/reward.txt 2>/dev/null || true

exit 0
