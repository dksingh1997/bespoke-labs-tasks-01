#!/bin/bash
# Harbor verifier for TCC optimization task.
#
# This script:
# 1. Verifies GCC is NOT present (anti-cheat)
# 2. Builds baseline TCC using bootstrap TCC
# 3. Builds modified TCC using bootstrap TCC
# 4. Runs correctness tests on both
# 5. Runs performance benchmarks on both
# 6. Computes reward (modified vs baseline speedup)
# 7. Writes reward to /logs/verifier/

set -o pipefail

# === Configuration ===
TCC_BOOTSTRAP="/usr/local/bin/tcc-bootstrap"
TCC_BOOTSTRAP_FLAGS="-B/usr/local/tcc-bootstrap-full"
TCC_SRC="/app/compiler-src/tcc"
RESULTS_BASE="/tmp/harbor_results"
VERIFIER_DIR="/logs/verifier"
TESTS_DIR="$(dirname "$(readlink -f "$0")")"

# Copy pristine benchmarks/scripts to writable location (anti-cheat: agent can't modify originals)
# This is needed because benchmark builds write to the benchmark directories
PRISTINE_COPY="/tmp/pristine_benchmarks"
rm -rf "$PRISTINE_COPY"
mkdir -p "$PRISTINE_COPY"
cp -r "$TESTS_DIR/benchmarks" "$PRISTINE_COPY/"
cp -r "$TESTS_DIR/scripts" "$PRISTINE_COPY/"
cp -r "$TESTS_DIR/data" "$PRISTINE_COPY/"

BENCHMARKS="$PRISTINE_COPY/benchmarks"
SCRIPTS="$PRISTINE_COPY/scripts"
DATA="$PRISTINE_COPY/data"

# Create output directories
mkdir -p "$VERIFIER_DIR" "$RESULTS_BASE"

CORRECTNESS_DIR="$RESULTS_BASE/correctness"
BENCHMARK_MODIFIED_DIR="$RESULTS_BASE/benchmark_modified"
BENCHMARK_BASELINE_DIR="$RESULTS_BASE/benchmark_baseline"
mkdir -p "$CORRECTNESS_DIR" "$BENCHMARK_MODIFIED_DIR" "$BENCHMARK_BASELINE_DIR"

LOG="$VERIFIER_DIR/verifier.log"

# Redirect output to log file (and also print to stdout)
exec > >(tee -a "$LOG") 2>&1

echo "========================================"
echo "  Harbor TCC Optimization Verifier"
echo "  (TCC-Bootstrap Mode - No GCC)"
echo "========================================"
echo "Start time: $(date)"
echo ""

# === Step 0: Verify GCC is NOT present (anti-cheat) ===
echo "=== Step 0: Anti-Cheat Verification ==="
echo ""

# Return success if the command exists and appears to be a disallowed compiler.
# Disallowed here means GNU/GCC or Clang/LLVM.
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

if is_disallowed_c_compiler gcc || is_disallowed_c_compiler g++ || is_disallowed_c_compiler clang || is_disallowed_c_compiler clang++ || is_disallowed_c_compiler cc; then
    echo "ERROR: GCC/Clang-family compiler found in environment!"
    echo "This should be impossible. Docker image is compromised."
    echo '{"reward": 0.0, "error": "gcc_present"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if command -v cc >/dev/null 2>&1; then
    echo "✓ 'cc' exists, but it is not GCC/Clang-family (allowed)"
fi
echo "✓ Verified: No GCC/Clang-family compiler in environment (cheating is impossible)"
echo "✓ Using TCC bootstrap compiler: $TCC_BOOTSTRAP"
$TCC_BOOTSTRAP --version 2>&1 | head -3
echo ""

# === Step 1: Build Baseline TCC (pristine) ===
echo "=== Step 1: Building Baseline TCC ==="
echo ""
echo "Building pristine TCC from /tests/baseline-tcc/ using TCC bootstrap"
echo ""

BASELINE_TCC_READONLY="/tests/baseline-tcc"
BASELINE_TCC_SRC="/tmp/baseline-tcc"
BASELINE_TCC_BIN="$BASELINE_TCC_SRC/tcc"
BASELINE_TCC_FLAGS="-B${BASELINE_TCC_SRC}"

if [[ ! -d "$BASELINE_TCC_READONLY" ]]; then
    echo "ERROR: Baseline TCC source not found at $BASELINE_TCC_READONLY"
    echo '{"reward": 0.0, "error": "no_baseline"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

# Copy to writable location
echo "Copying baseline TCC to writable location..."
rm -rf "$BASELINE_TCC_SRC"
cp -r "$BASELINE_TCC_READONLY" "$BASELINE_TCC_SRC"

# Build with TCC bootstrap
echo "Building baseline TCC with bootstrap compiler..."
cd "$BASELINE_TCC_SRC"
make clean 2>/dev/null || true

if ! CC="$TCC_BOOTSTRAP" CFLAGS="$TCC_BOOTSTRAP_FLAGS" ./configure 2>&1; then
    echo "ERROR: Baseline TCC configure failed"
    echo '{"reward": 0.0, "error": "baseline_configure_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make CC="$TCC_BOOTSTRAP" CFLAGS="$TCC_BOOTSTRAP_FLAGS" 2>&1; then
    echo "ERROR: Baseline TCC build failed"
    echo '{"reward": 0.0, "error": "baseline_build_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if [[ ! -x "$BASELINE_TCC_BIN" ]]; then
    echo "ERROR: Baseline TCC binary not found: $BASELINE_TCC_BIN"
    echo '{"reward": 0.0, "error": "baseline_binary_missing"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

echo "✓ Baseline TCC built successfully"
$BASELINE_TCC_BIN --version 2>&1 | head -3
echo ""

# === Step 2: Build Modified TCC ===
echo "=== Step 2: Building Modified TCC ==="
echo ""
echo "Building agent's modified TCC using TCC bootstrap"
echo ""

cd "$TCC_SRC"
make clean 2>/dev/null || true

if ! CC="$TCC_BOOTSTRAP" CFLAGS="$TCC_BOOTSTRAP_FLAGS" ./configure 2>&1; then
    echo "ERROR: Modified TCC configure failed"
    echo '{"reward": 0.0, "error": "modified_configure_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make CC="$TCC_BOOTSTRAP" CFLAGS="$TCC_BOOTSTRAP_FLAGS" 2>&1; then
    echo "ERROR: Modified TCC build failed"
    echo '{"reward": 0.0, "error": "modified_build_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

TCC_BIN="$TCC_SRC/tcc"
TCC_FLAGS="-B${TCC_SRC}"

if [[ ! -x "$TCC_BIN" ]]; then
    echo "ERROR: Modified TCC binary not found: $TCC_BIN"
    echo '{"reward": 0.0, "error": "modified_binary_missing"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

echo "✓ Modified TCC built successfully"
$TCC_BIN --version 2>&1 | head -3
echo ""

# Basic sanity check
echo "Verifying modified TCC basic functionality..."
echo 'int main() { return 0; }' > /tmp/verify_test.c
if ! "$TCC_BIN" $TCC_FLAGS /tmp/verify_test.c -o /tmp/verify_test 2>&1; then
    echo "ERROR: Modified TCC cannot compile a basic program"
    echo '{"reward": 0.0, "error": "modified_basic_test_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi
if ! /tmp/verify_test; then
    echo "ERROR: Modified TCC-compiled program failed to run"
    echo '{"reward": 0.0, "error": "modified_execution_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi
rm -f /tmp/verify_test.c /tmp/verify_test
echo "✓ Modified TCC basic sanity check passed"
echo ""

# === Step 3: Run Correctness Tests ===
echo "=== Step 3: Running Correctness Tests ==="
echo ""

# Use separate directories for baseline and modified to avoid overwriting
CORRECTNESS_BASELINE_DIR="$CORRECTNESS_DIR/baseline"
CORRECTNESS_MODIFIED_DIR="$CORRECTNESS_DIR/modified"
mkdir -p "$CORRECTNESS_BASELINE_DIR" "$CORRECTNESS_MODIFIED_DIR"

# Test baseline TCC
"$SCRIPTS/correctness_tests.sh" \
    --custom "$BASELINE_TCC_BIN" \
    --custom-flags "$BASELINE_TCC_FLAGS" \
    --results-dir "$CORRECTNESS_BASELINE_DIR" \
    --timeout 10 \
    2>&1 || true

# Test modified TCC
"$SCRIPTS/correctness_tests.sh" \
    --custom "$TCC_BIN" \
    --custom-flags "$TCC_FLAGS" \
    --results-dir "$CORRECTNESS_MODIFIED_DIR" \
    --timeout 10 \
    2>&1 || true

BASELINE_CORRECTNESS_CSV="$CORRECTNESS_BASELINE_DIR/results.csv"
MODIFIED_CORRECTNESS_CSV="$CORRECTNESS_MODIFIED_DIR/results.csv"

echo ""
echo "Baseline correctness CSV: $BASELINE_CORRECTNESS_CSV"
echo "Modified correctness CSV: $MODIFIED_CORRECTNESS_CSV"
echo ""

# === Step 4: Run Performance Benchmarks ===
echo "=== Step 4: Running Performance Benchmarks ==="
echo ""

# Benchmark baseline TCC
echo "Benchmarking baseline TCC..."
"$SCRIPTS/benchmark_suite.sh" \
    --custom "$BASELINE_TCC_BIN" \
    --custom-flags "$BASELINE_TCC_FLAGS" \
    --suite llvm \
    --benchmark heapsort \
    --results-dir "$BENCHMARK_BASELINE_DIR" \
    --timeout 120 \
    2>&1 || true

BASELINE_CSV="$BENCHMARK_BASELINE_DIR/results.csv"
if [[ ! -f "$BASELINE_CSV" ]]; then
    BASELINE_CSV=$(find "$BENCHMARK_BASELINE_DIR" -name "results.csv" -type f 2>/dev/null | head -1)
fi

echo ""
echo "Baseline benchmark CSV: $BASELINE_CSV"
echo ""

# Benchmark modified TCC
echo "Benchmarking modified TCC..."
"$SCRIPTS/benchmark_suite.sh" \
    --custom "$TCC_BIN" \
    --custom-flags "$TCC_FLAGS" \
    --suite llvm \
    --benchmark heapsort \
    --results-dir "$BENCHMARK_MODIFIED_DIR" \
    --timeout 120 \
    2>&1 || true

MODIFIED_CSV="$BENCHMARK_MODIFIED_DIR/results.csv"
if [[ ! -f "$MODIFIED_CSV" ]]; then
    MODIFIED_CSV=$(find "$BENCHMARK_MODIFIED_DIR" -name "results.csv" -type f 2>/dev/null | head -1)
fi

echo ""
echo "Modified benchmark CSV: $MODIFIED_CSV"
echo ""

# === Step 5: Compute Reward ===
echo "=== Step 5: Computing Reward ==="
echo ""

python3 "$TESTS_DIR/compute_reward.py" \
    --baseline-csv "$BASELINE_CSV" \
    --modified-csv "$MODIFIED_CSV" \
    --baseline-correctness-csv "$BASELINE_CORRECTNESS_CSV" \
    --modified-correctness-csv "$MODIFIED_CORRECTNESS_CSV" \
    --output-dir "$VERIFIER_DIR" \
    2>&1

echo ""
echo "End time: $(date)"
echo "========================================"

# Verify reward files exist
if [[ -f "$VERIFIER_DIR/reward.json" ]]; then
    echo "✓ reward.json written successfully"
    cat "$VERIFIER_DIR/reward.json"
else
    echo "ERROR: reward.json not found, writing fallback"
    echo '{"reward": 0.0, "error": "reward_computation_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
fi
