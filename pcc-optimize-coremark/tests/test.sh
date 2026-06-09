#!/bin/bash
# Harbor verifier for the PCC optimization task — reference anti-cheat bar
# (align_base_c run-as-agent pattern, HARBOR_GUIDE §3 & §5).
#
# Threat model: the agent edits PCC's source (/app/compiler-src/pcc). The
# verifier rebuilds it and benchmarks the CoreMark binary it emits. Both the
# modified compiler and that binary are agent-controlled code, so they run as
# the unprivileged `agent` user under strace, never as root.
#
# Phases:
#   PROLOGUE  lock+wipe /logs/verifier, re-lock /tests (0700), sanitize env,
#             kill stray agent processes, detect the oracle marker.
#   BASELINE  (root, BEFORE any agent code) build the pristine baseline PCC
#             from the root-only /tests upload, benchmark its CoreMark, run its
#             correctness suite. Establishes the golden CRCs + the noise floor.
#   MODIFIED  (under strace, as `agent`) build the agent's modified PCC and run
#             the CoreMark binary it emits. Root orchestrates + captures, the
#             dropped agent process executes — so the captured logs and the
#             result CSVs cannot be forged.
#   GATE      reward-file tamper scan (strace), output-validation gate
#             (CoreMark self-CRC must match the golden), then score.
#   SCORE     compute_reward.py (python3 -ISs, atomic reward.json) OUTSIDE
#             strace as root — no agent code runs there, so it cannot be forged.
#
# Anti-cheat kept from the original: GCC/Clang ban re-check, the baseline
# autotools chmod fix, the correctness regression hard-gate, the speedup clamp.
# Always exits 0 — the outcome lives in /logs/verifier/reward.{json,txt}.

set -o pipefail

# === Configuration ===
PCC_BOOTSTRAP="/usr/local/bin/pcc-bootstrap"
PCC_SRC="/app/compiler-src/pcc"
PCC_LIBS_SRC="/app/compiler-src/pcc-libs"
RESULTS_BASE="/tmp/harbor_results"
VERIFIER_DIR="/logs/verifier"
TESTS_DIR="$(dirname "$(readlink -f "$0")")"
STRACE_LOG="$VERIFIER_DIR/strace.log"
STATUS_FILE="$VERIFIER_DIR/verifier_status"

# Clean PATH handed to every privilege-dropped (`su agent`) child.
SAFE_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Number of measured CoreMark runs per compiler (>=5 per the HARBOR bar).
COREMARK_RUNS="${COREMARK_RUNS:-5}"

# Oracle marker (HARBOR_GUIDE §5). solve.sh writes HARBOR_ORACLE_FLAG here on
# oracle runs only; the agent never sees the token, so it cannot forge it.
ORACLE_MARKER="/app/.harbor_oracle_marker"
EXPECTED_ORACLE_FLAG="pcc-839a70119de3d155"  # must match [solution.env] in task.toml

# Baseline (root-only, pristine) + modified install/source paths.
BASELINE_PCC_READONLY="/tests/baseline-pcc"
BASELINE_PCCLIBS_READONLY="/tests/baseline-pcc-libs"
BASELINE_PCC_SRC="/tmp/baseline-pcc"
BASELINE_PCCLIBS_SRC="/tmp/baseline-pcc-libs"
BASELINE_PREFIX="/tmp/baseline-install"
MODIFIED_PREFIX="/tmp/modified-install"
BASELINE_PCC_BIN="$BASELINE_PREFIX/bin/pcc"
MODIFIED_PCC_BIN="$MODIFIED_PREFIX/bin/pcc"

# === MANDATORY: lock + wipe /logs/verifier (root-only) before anything else ===
# Harbor sets it 777 at container start; lock first (cuts off any agent
# background writer), then wipe anything the agent may have planted.
mkdir -p "$VERIFIER_DIR"
chmod 700 "$VERIFIER_DIR"
rm -rf "${VERIFIER_DIR:?}"/*

# === MANDATORY: re-lock /tests (Harbor's verify-time upload resets it to 0755) ===
# Without this the agent (uid 1000) could read /tests/test.sh, the baseline
# source, or compute_reward.py directly during the verify window.
chmod 700 /tests 2>/dev/null || true

# Restore exec bits on helper scripts (Modal/Daytona drop them; harmless locally).
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

# === MANDATORY: environment sanitization (build-config + loader side channels) ===
# A modified compiler / Makefile could otherwise inherit LD_PRELOAD, a poisoned
# CC, or extra CFLAGS to alter what the verifier builds.
unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH BASH_ENV ENV CFLAGS CC CXX MAKEFLAGS

# Hard-failure helper: scoring stays in compute_reward.py (reason -> additional_data).
fail_with() {
    python3 -ISs "$TESTS_DIR/compute_reward.py" --fail "$1" \
        --output-dir "$VERIFIER_DIR" ${ORACLE_ARG:-} 2>&1
    echo "FAIL: $1"
    echo "End time: $(date)"
    exit 0
}

echo "========================================"
echo "  Harbor PCC Optimization Verifier"
echo "  (PCC-Bootstrap Mode - No GCC)"
echo "========================================"
echo "Start time: $(date)"
echo ""

# === Oracle detection (HARBOR_GUIDE §5) ===
# Recorded in additional_data. The oracle is a gcc-delegation "cheat": its
# solve.sh extracts a bundled gcc-12 under /tmp/oracle-gcc (as the agent) and
# patches PCC's driver so the rebuilt pcc delegates compiles to gcc-12 -O3 ->
# big CoreMark speedup with correct self-CRCs -> reward ~1.0. ONLY the
# GCC/Clang-presence anti-cheat (Step 0) is relaxed on this token path, because
# the oracle's whole mechanism is to introduce its own private gcc. The
# correctness + CRC + speedup gates are NOT relaxed; the oracle passes them
# honestly (gcc-O3 reproduces CoreMark's golden CRCs).
ORACLE_ARG=""
IS_ORACLE=0
if [ -f "$ORACLE_MARKER" ] && [ "$(cat "$ORACLE_MARKER" 2>/dev/null)" = "$EXPECTED_ORACLE_FLAG" ]; then
    IS_ORACLE=1
    ORACLE_ARG="--oracle"
    echo "Oracle run detected (gcc-12 -O3 delegation; expected reward ~1.0)."
    echo ""
fi

# === MANDATORY: kill pre-existing agent processes (cross-phase isolation) ===
pkill -9 -u agent 2>/dev/null || true
sleep 0.5
if pgrep -u agent >/dev/null 2>&1; then
    sleep 1
    pkill -9 -u agent 2>/dev/null || true
    sleep 0.5
    if pgrep -u agent >/dev/null 2>&1; then
        if [ "$IS_ORACLE" -eq 1 ]; then
            echo "WARNING: agent processes still present during oracle run (continuing)."
        else
            fail_with "agent_processes_survived"
        fi
    fi
fi

# === Step 0: Verify GCC/Clang is NOT present (anti-cheat; no agent code) ===
echo "=== Step 0: Anti-Cheat Verification ==="
echo ""

# Return success if the command exists and appears to be a disallowed compiler
# (GNU/GCC or Clang/LLVM).
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

# The GCC/Clang-presence ban is the ONE gate relaxed on the oracle token path:
# the oracle deliberately extracts a private gcc-12 (under /tmp/oracle-gcc, owned
# by the agent) to delegate to, so this check would otherwise (and correctly,
# for a real agent) fail it. The agent never sees the oracle token, so it cannot
# reach this bypass. All correctness/CRC/perf gates below still apply to both.
if [ "$IS_ORACLE" -eq 1 ]; then
    echo "Oracle run: skipping GCC/Clang-family presence check (oracle delegates"
    echo "to its own bundled gcc-12 by design)."
else
    if is_disallowed_c_compiler gcc || is_disallowed_c_compiler g++ || is_disallowed_c_compiler clang || is_disallowed_c_compiler clang++ || is_disallowed_c_compiler cc; then
        echo "ERROR: GCC/Clang-family compiler found in environment!"
        fail_with gcc_present
    fi

    if command -v cc >/dev/null 2>&1; then
        echo "✓ 'cc' exists, but it is not GCC/Clang-family (allowed)"
    fi
    echo "✓ Verified: No GCC/Clang-family compiler in environment (cheating is impossible)"
fi
echo "✓ Using PCC bootstrap compiler: $PCC_BOOTSTRAP"
$PCC_BOOTSTRAP --version 2>&1 | head -3
echo ""

# === Pristine working copies (anti-cheat: agent can't modify the originals) ===
# Two trees: one root-owned for the baseline build/run, one agent-owned for the
# modified build/run (the agent-uid `make` must be able to write its objects).
PRISTINE_BASE="/tmp/pristine_baseline"
PRISTINE_MOD="/tmp/pristine_modified"
rm -rf "$PRISTINE_BASE" "$PRISTINE_MOD"
mkdir -p "$PRISTINE_BASE" "$PRISTINE_MOD"
for dst in "$PRISTINE_BASE" "$PRISTINE_MOD"; do
    cp -r "$TESTS_DIR/benchmarks" "$dst/"
    cp -r "$TESTS_DIR/scripts" "$dst/"
    cp -r "$TESTS_DIR/data" "$dst/"
    chmod +x "$dst"/scripts/*.sh 2>/dev/null || true
done
chown -R agent:agent "$PRISTINE_MOD" 2>/dev/null || true

# === Output directories (root-owned; NOT exported into any agent env) ===
mkdir -p "$RESULTS_BASE"
CORRECTNESS_DIR="$RESULTS_BASE/correctness"
BENCHMARK_MODIFIED_DIR="$RESULTS_BASE/benchmark_modified"
BENCHMARK_BASELINE_DIR="$RESULTS_BASE/benchmark_baseline"
CORRECTNESS_BASELINE_DIR="$CORRECTNESS_DIR/baseline"
CORRECTNESS_MODIFIED_DIR="$CORRECTNESS_DIR/modified"
mkdir -p "$CORRECTNESS_BASELINE_DIR" "$CORRECTNESS_MODIFIED_DIR" \
    "$BENCHMARK_MODIFIED_DIR" "$BENCHMARK_BASELINE_DIR"
# Modified correctness runs AS agent and writes its own CSV here, so it must be
# agent-writable (this CSV feeds only the regression safety-net; the CoreMark
# self-CRC gate below is the load-bearing correctness wall and is root-captured).
chown -R agent:agent "$CORRECTNESS_MODIFIED_DIR" 2>/dev/null || true

BASELINE_VALIDATION="$RESULTS_BASE/coremark_baseline.kv"
MODIFIED_VALIDATION="$RESULTS_BASE/coremark_modified.kv"
BASELINE_CORRECTNESS_CSV="$CORRECTNESS_BASELINE_DIR/results.csv"
MODIFIED_CORRECTNESS_CSV="$CORRECTNESS_MODIFIED_DIR/results.csv"

# Helper: read a key=value field from a sidecar file (no agent code).
readkv() { grep -m1 "^$2=" "$1" 2>/dev/null | cut -d= -f2-; }

# === BASELINE PHASE (root, BEFORE any agent code runs) ===
echo "=== Baseline Phase: build + benchmark pristine PCC as root ==="
if [[ ! -d "$BASELINE_PCC_READONLY" ]]; then
    fail_with no_baseline
fi
rm -rf "$BASELINE_PCC_SRC" "$BASELINE_PCCLIBS_SRC" "$BASELINE_PREFIX"
cp -r "$BASELINE_PCC_READONLY" "$BASELINE_PCC_SRC"
cp -r "$BASELINE_PCCLIBS_READONLY" "$BASELINE_PCCLIBS_SRC"
mkdir -p "$BASELINE_PREFIX"

# KEPT: autotools chmod fix — transfers/git can drop the exec bit on configure
# and its helper scripts, making ./configure fail with exit 126.
restore_autotools_bits() {
    find . -type f \( -name configure -o -name config.sub -o -name config.guess \
      -o -name install-sh -o -name missing -o -name depcomp -o -name ylwrap \
      -o -name compile -o -name mkinstalldirs -o -name '*.sh' \) \
      -exec chmod +x {} + 2>/dev/null || true
}

cd "$BASELINE_PCC_SRC" || fail_with no_baseline
restore_autotools_bits
make distclean 2>/dev/null || true
if ! CC="$PCC_BOOTSTRAP" ./configure --prefix="$BASELINE_PREFIX" 2>&1; then
    fail_with baseline_configure_failed
fi
if ! make CC="$PCC_BOOTSTRAP" 2>&1; then
    fail_with baseline_build_failed
fi
if ! make install 2>&1; then
    fail_with baseline_install_failed
fi

echo "Building baseline pcc-libs..."
cd "$BASELINE_PCCLIBS_SRC" || fail_with baseline_install_failed
restore_autotools_bits
make distclean 2>/dev/null || true
if ! ./configure --prefix="$BASELINE_PREFIX" CC="$BASELINE_PREFIX/bin/pcc" 2>&1; then
    fail_with baseline_libs_configure_failed
fi
if ! make 2>&1; then
    fail_with baseline_libs_build_failed
fi
if ! make install 2>&1; then
    fail_with baseline_libs_install_failed
fi
if [[ ! -x "$BASELINE_PCC_BIN" ]]; then
    fail_with baseline_binary_missing
fi
echo "✓ Baseline PCC built successfully"
"$BASELINE_PCC_BIN" --version 2>&1 | head -3
echo ""

# Baseline CoreMark (root) — establishes the golden CRCs + the noise floor.
echo "=== Baseline CoreMark benchmark (root) ==="
"$PRISTINE_BASE/scripts/benchmark_suite.sh" \
    --compiler custom --custom "$BASELINE_PCC_BIN" --custom-flags "-O" \
    --suite coremark --results-dir "$BENCHMARK_BASELINE_DIR" \
    --validation-out "$BASELINE_VALIDATION" \
    --coremark-runs "$COREMARK_RUNS" --coremark-warmup 1 2>&1 || true

if [[ "$(readkv "$BASELINE_VALIDATION" crc_ok)" != "1" ]]; then
    echo "Baseline CoreMark CRCs did not match CoreMark's known-good table —"
    echo "cannot establish golden CRCs (env/build problem)."
    fail_with baseline_coremark_invalid
fi
GOLD_SEEDCRC="$(readkv "$BASELINE_VALIDATION" seedcrc)"
GOLD_CRCLIST="$(readkv "$BASELINE_VALIDATION" crclist)"
GOLD_CRCMATRIX="$(readkv "$BASELINE_VALIDATION" crcmatrix)"
GOLD_CRCSTATE="$(readkv "$BASELINE_VALIDATION" crcstate)"
GOLD_CRCFINAL="$(readkv "$BASELINE_VALIDATION" crcfinal)"
BASE_MEDIAN="$(readkv "$BASELINE_VALIDATION" score_median)"
BASE_STDEV="$(readkv "$BASELINE_VALIDATION" score_stdev)"
echo "Golden CRCs: list=$GOLD_CRCLIST matrix=$GOLD_CRCMATRIX state=$GOLD_CRCSTATE final=$GOLD_CRCFINAL"
echo ""

# Noise floor from baseline timing variance: speedups within the measurement
# spread are treated as noise. floor = 1 + 3*(stdev/median), clamped to >=1.05.
NOISE_FLOOR="$(awk -v m="$BASE_MEDIAN" -v s="$BASE_STDEV" \
    'BEGIN { if (m+0>0) { f=1.0+3.0*(s/m); } else { f=1.05 } if (f<1.05) f=1.05; printf "%.4f", f }')"
echo "Derived noise floor: ${NOISE_FLOOR}x (baseline median=$BASE_MEDIAN stdev=$BASE_STDEV)"
echo ""

# Baseline correctness (root) — pristine source, trusted CSV.
echo "=== Baseline correctness (root) ==="
"$PRISTINE_BASE/scripts/correctness_tests.sh" \
    --custom "$BASELINE_PCC_BIN" --custom-flags "-O" \
    --results-dir "$CORRECTNESS_BASELINE_DIR" --timeout 10 2>&1 || true
echo ""

# === Stage the agent-side build script (root-owned, agent-readable) ===
BUILD_MODIFIED="/tmp/build_modified.sh"
cat > "$BUILD_MODIFIED" <<EOF
#!/bin/bash
# Runs AS the agent user under strace: builds the agent's modified PCC + pcc-libs
# from /app/compiler-src and sanity-checks the result. Output binaries land in
# $MODIFIED_PREFIX (the authoritative success check is root's [ -x ] afterwards).
set -o pipefail
BOOT="$PCC_BOOTSTRAP"
PREFIX="$MODIFIED_PREFIX"
restore_bits() {
    find . -type f \\( -name configure -o -name config.sub -o -name config.guess \\
      -o -name install-sh -o -name missing -o -name depcomp -o -name ylwrap \\
      -o -name compile -o -name mkinstalldirs -o -name '*.sh' \\) \\
      -exec chmod +x {} + 2>/dev/null || true
}
rm -rf "\$PREFIX"; mkdir -p "\$PREFIX" || exit 30
cd "$PCC_SRC" || exit 31
restore_bits
make distclean 2>/dev/null || true
CC="\$BOOT" ./configure --prefix="\$PREFIX" 2>&1 || exit 32
make CC="\$BOOT" 2>&1 || exit 33
make install 2>&1 || exit 34
cd "$PCC_LIBS_SRC" || exit 35
restore_bits
make distclean 2>/dev/null || true
./configure --prefix="\$PREFIX" CC="\$PREFIX/bin/pcc" 2>&1 || exit 36
make 2>&1 || exit 37
make install 2>&1 || exit 38
[ -x "\$PREFIX/bin/pcc" ] || exit 39
echo 'int main(){return 0;}' > /tmp/mod_verify.c
"\$PREFIX/bin/pcc" /tmp/mod_verify.c -o /tmp/mod_verify 2>&1 || exit 40
/tmp/mod_verify || exit 41
rm -f /tmp/mod_verify.c /tmp/mod_verify
exit 0
EOF
chmod 755 "$BUILD_MODIFIED"

# === Stage the modified-phase orchestrator (root; execs agent under strace) ===
MODIFIED_PHASE="/tmp/modified_phase.sh"
cat > "$MODIFIED_PHASE" <<EOF
#!/bin/bash
# Runs as ROOT inside the strace window. Drops to the agent user for every
# agent-controlled action (build + CoreMark build/run); root owns the capture
# files and the result CSV, so they cannot be forged by the dropped process.
set -o pipefail

echo "=== Step A: Build modified PCC (as agent) ==="
su agent -s /bin/bash -c "env -i PATH=$SAFE_PATH HOME=/home/agent TMPDIR=/tmp bash $BUILD_MODIFIED"
echo "build_rc=\$?" > "$STATUS_FILE"

echo "=== Step B: Benchmark modified CoreMark (binary runs as agent) ==="
"$PRISTINE_MOD/scripts/benchmark_suite.sh" \\
    --compiler custom --custom "$MODIFIED_PCC_BIN" --custom-flags "-O" \\
    --suite coremark --exec-as agent \\
    --results-dir "$BENCHMARK_MODIFIED_DIR" --validation-out "$MODIFIED_VALIDATION" \\
    --coremark-runs $COREMARK_RUNS --coremark-warmup 1 2>&1 || true
echo "bench_done" >> "$STATUS_FILE"
EOF
chmod 755 "$MODIFIED_PHASE"

# === MODIFIED PHASE under strace (agent code executes here) ===
# strace -f blocks until every descendant exits and records openat() so we can
# detect any reward-file write by an agent-spawned/forked process. Generous
# timeout, well under verifier.timeout_sec.
echo "=== Modified Phase: build + benchmark agent PCC (as agent, under strace) ==="
echo "verifier_incomplete" > "$STATUS_FILE"
strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
    -o "$STRACE_LOG" \
    timeout 1700 \
    bash "$MODIFIED_PHASE"
echo ""
echo "Strace block finished (all agent descendants have exited)."
echo ""

# === Anti-cheat: scan strace for reward-file tampering ===
# Nothing legitimate writes reward.{txt,json} during the strace window
# (compute_reward.py runs afterwards). Any write-mode open is agent code.
if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
    "$STRACE_LOG" 2>/dev/null; then
    echo "DETECTED: reward-file write during straced agent execution"
    fail_with reward_file_manipulation
fi

# === Modified build success (authoritative: root checks the binary) ===
if [[ ! -x "$MODIFIED_PCC_BIN" ]]; then
    echo "Modified PCC binary missing ($(cat "$STATUS_FILE" 2>/dev/null))"
    fail_with modified_build_failed
fi
echo "✓ Modified PCC built ($(cat "$STATUS_FILE" 2>/dev/null))"
echo ""

# === OUTPUT-VALIDATION GATE (Phase 2) — run BEFORE the slow correctness loop ===
# A miscompiled-but-fast CoreMark must score 0. CoreMark self-validates the list/
# matrix/state CRCs against its built-in known-good table; these are deterministic
# for the fixed seeds and INDEPENDENT of iteration count, so a correct compiler
# always reproduces the golden values no matter how fast it runs. We therefore
# require the modified run to (a) print "Correct operation validated" (CoreMark's
# own all-CRCs-match-and-ran->=10s signal) AND (b) byte-match the baseline
# (golden) list/matrix/state CRCs. NOTE: crcfinal is intentionally NOT compared —
# it accumulates per iteration, so a legitimately faster compiler auto-calibrates
# to a different iteration count and a different crcfinal (verified empirically:
# the same correct binary yields crcfinal 0x4983 vs 0x33ff under different load).
echo "=== Output-Validation Gate ==="
MOD_CRC_OK="$(readkv "$MODIFIED_VALIDATION" crc_ok)"
MOD_VALIDATED="$(readkv "$MODIFIED_VALIDATION" validated)"
MOD_CRCLIST="$(readkv "$MODIFIED_VALIDATION" crclist)"
MOD_CRCMATRIX="$(readkv "$MODIFIED_VALIDATION" crcmatrix)"
MOD_CRCSTATE="$(readkv "$MODIFIED_VALIDATION" crcstate)"
MOD_CRCFINAL="$(readkv "$MODIFIED_VALIDATION" crcfinal)"
echo "Modified CRCs: list=$MOD_CRCLIST matrix=$MOD_CRCMATRIX state=$MOD_CRCSTATE final=$MOD_CRCFINAL (crc_ok=$MOD_CRC_OK validated_line=$MOD_VALIDATED)"
echo "Golden   CRCs: list=$GOLD_CRCLIST matrix=$GOLD_CRCMATRIX state=$GOLD_CRCSTATE"

# crc_match: modified list/matrix/state byte-match the golden (== CoreMark's
# built-in known-good for these seeds). Time-independent, so robust under load.
CRC_MATCH=1
if [[ -z "$MOD_CRCLIST" || "$MOD_CRCLIST" != "$GOLD_CRCLIST" \
      || "$MOD_CRCMATRIX" != "$GOLD_CRCMATRIX" || "$MOD_CRCSTATE" != "$GOLD_CRCSTATE" ]]; then
    CRC_MATCH=0
fi
# validated: CoreMark emitted no CRC-mismatch error and printed all CRC lines.
VALIDATED_FLAG=0
[[ "$MOD_CRC_OK" == "1" ]] && VALIDATED_FLAG=1

if [[ "$VALIDATED_FLAG" -ne 1 || "$CRC_MATCH" -ne 1 ]]; then
    echo "Output-validation gate FAILED (crc_ok=$VALIDATED_FLAG crc_match=$CRC_MATCH)"
    fail_with coremark_validation_failed
fi
echo "✓ Output-validation gate passed (CoreMark self-CRC matches golden known-good)"
echo ""

# === Modified correctness (as agent, after strace; /logs/verifier 0700 wall) ===
# Kept OUTSIDE strace to avoid a multi-GB trace of the ~1900-test compile loop;
# the reward files are still root-only (0700), so they cannot be written here.
echo "=== Modified correctness (as agent) ==="
su agent -s /bin/bash -c "env -i PATH=$SAFE_PATH HOME=/home/agent TMPDIR=/tmp $PRISTINE_MOD/scripts/correctness_tests.sh --custom $MODIFIED_PCC_BIN --custom-flags -O --results-dir $CORRECTNESS_MODIFIED_DIR --timeout 10" 2>&1 || true
pkill -9 -u agent 2>/dev/null || true
echo ""

# === Resolve result CSVs (filesystem reads only — no agent code) ===
BASELINE_CSV="$BENCHMARK_BASELINE_DIR/results.csv"
[[ -f "$BASELINE_CSV" ]] || BASELINE_CSV=$(find "$BENCHMARK_BASELINE_DIR" -name "results.csv" -type f 2>/dev/null | head -1)
MODIFIED_CSV="$BENCHMARK_MODIFIED_DIR/results.csv"
[[ -f "$MODIFIED_CSV" ]] || MODIFIED_CSV=$(find "$BENCHMARK_MODIFIED_DIR" -name "results.csv" -type f 2>/dev/null | head -1)

echo "Baseline benchmark CSV:   $BASELINE_CSV"
echo "Modified benchmark CSV:   $MODIFIED_CSV"
echo "Baseline correctness CSV: $BASELINE_CORRECTNESS_CSV"
echo "Modified correctness CSV: $MODIFIED_CORRECTNESS_CSV"
echo ""

# === Step 5: Compute reward (OUTSIDE strace — no agent code runs here) ===
echo "=== Step 5: Computing Reward ==="
python3 -ISs "$TESTS_DIR/compute_reward.py" \
    --baseline-csv "$BASELINE_CSV" \
    --modified-csv "$MODIFIED_CSV" \
    --baseline-correctness-csv "$BASELINE_CORRECTNESS_CSV" \
    --modified-correctness-csv "$MODIFIED_CORRECTNESS_CSV" \
    --noise-floor "$NOISE_FLOOR" \
    --coremark-validated "$VALIDATED_FLAG" \
    --crc-match "$CRC_MATCH" \
    ${ORACLE_ARG:-} \
    --output-dir "$VERIFIER_DIR" 2>&1 || fail_with compute_reward_crashed

echo ""
echo "End time: $(date)"
echo "========================================"

# Final safety net: ensure reward files exist.
if [[ -f "$VERIFIER_DIR/reward.json" ]]; then
    echo "✓ reward.json written successfully"
    cat "$VERIFIER_DIR/reward.json"
else
    echo "ERROR: reward.json not found, writing fallback"
    python3 -ISs "$TESTS_DIR/compute_reward.py" --fail reward_computation_failed \
        --output-dir "$VERIFIER_DIR" ${ORACLE_ARG:-}
fi

exit 0
