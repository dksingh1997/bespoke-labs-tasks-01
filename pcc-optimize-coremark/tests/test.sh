#!/bin/bash
# Harbor verifier for PCC optimization task.
#
# This script:
# 1. Verifies GCC is NOT present (anti-cheat)
# 2. Builds baseline PCC using bootstrap PCC
# 3. Builds modified PCC using bootstrap PCC
# 4. Runs correctness tests on both
# 5. Runs performance benchmarks on both
# 6. Computes reward (modified vs baseline speedup)
# 7. Writes reward to /logs/verifier/

set -o pipefail

# === Configuration ===
PCC_BOOTSTRAP="/usr/local/bin/pcc-bootstrap"
PCC_BOOTSTRAP_FULL="/usr/local/pcc-bootstrap"
PCC_SRC="/app/compiler-src/pcc"
PCC_LIBS_SRC="/app/compiler-src/pcc-libs"
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
echo "  Harbor PCC Optimization Verifier"
echo "  (PCC-Bootstrap Mode - No GCC)"
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
echo "✓ Using PCC bootstrap compiler: $PCC_BOOTSTRAP"
$PCC_BOOTSTRAP --version 2>&1 | head -3
echo ""

# === Step 1: Build Baseline PCC (pristine) ===
echo "=== Step 1: Building Baseline PCC ==="
echo ""
echo "Building pristine PCC from /tests/baseline-pcc/ using PCC bootstrap"
echo ""

BASELINE_PCC_READONLY="/tests/baseline-pcc"
BASELINE_PCCLIBS_READONLY="/tests/baseline-pcc-libs"
BASELINE_PCC_SRC="/tmp/baseline-pcc"
BASELINE_PCCLIBS_SRC="/tmp/baseline-pcc-libs"
BASELINE_PREFIX="/tmp/baseline-install"

if [[ ! -d "$BASELINE_PCC_READONLY" ]]; then
    echo "ERROR: Baseline PCC source not found at $BASELINE_PCC_READONLY"
    echo '{"reward": 0.0, "error": "no_baseline"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

# Copy to writable location
echo "Copying baseline PCC to writable location..."
rm -rf "$BASELINE_PCC_SRC" "$BASELINE_PCCLIBS_SRC" "$BASELINE_PREFIX"
cp -r "$BASELINE_PCC_READONLY" "$BASELINE_PCC_SRC"
cp -r "$BASELINE_PCCLIBS_READONLY" "$BASELINE_PCCLIBS_SRC"
mkdir -p "$BASELINE_PREFIX"

# Build baseline PCC with bootstrap compiler
echo "Building baseline PCC with bootstrap compiler..."
cd "$BASELINE_PCC_SRC"
make distclean 2>/dev/null || true

if ! CC="$PCC_BOOTSTRAP" ./configure --prefix="$BASELINE_PREFIX" 2>&1; then
    echo "ERROR: Baseline PCC configure failed"
    echo '{"reward": 0.0, "error": "baseline_configure_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make CC="$PCC_BOOTSTRAP" 2>&1; then
    echo "ERROR: Baseline PCC build failed"
    echo '{"reward": 0.0, "error": "baseline_build_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make install 2>&1; then
    echo "ERROR: Baseline PCC install failed"
    echo '{"reward": 0.0, "error": "baseline_install_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

# Build baseline pcc-libs
echo "Building baseline pcc-libs..."
cd "$BASELINE_PCCLIBS_SRC"
make distclean 2>/dev/null || true

if ! ./configure --prefix="$BASELINE_PREFIX" CC="$BASELINE_PREFIX/bin/pcc" 2>&1; then
    echo "ERROR: Baseline pcc-libs configure failed"
    echo '{"reward": 0.0, "error": "baseline_libs_configure_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make 2>&1; then
    echo "ERROR: Baseline pcc-libs build failed"
    echo '{"reward": 0.0, "error": "baseline_libs_build_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make install 2>&1; then
    echo "ERROR: Baseline pcc-libs install failed"
    echo '{"reward": 0.0, "error": "baseline_libs_install_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

BASELINE_PCC_BIN="$BASELINE_PREFIX/bin/pcc"

if [[ ! -x "$BASELINE_PCC_BIN" ]]; then
    echo "ERROR: Baseline PCC binary not found: $BASELINE_PCC_BIN"
    echo '{"reward": 0.0, "error": "baseline_binary_missing"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

echo "✓ Baseline PCC built successfully"
$BASELINE_PCC_BIN --version 2>&1 | head -3
echo ""

# === Step 2: Build Modified PCC ===
echo "=== Step 2: Building Modified PCC ==="
echo ""
echo "Building agent's modified PCC using PCC bootstrap"
echo ""

MODIFIED_PREFIX="/tmp/modified-install"
rm -rf "$MODIFIED_PREFIX"
mkdir -p "$MODIFIED_PREFIX"

cd "$PCC_SRC"
make distclean 2>/dev/null || true

if ! CC="$PCC_BOOTSTRAP" ./configure --prefix="$MODIFIED_PREFIX" 2>&1; then
    echo "ERROR: Modified PCC configure failed"
    echo '{"reward": 0.0, "error": "modified_configure_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make CC="$PCC_BOOTSTRAP" 2>&1; then
    echo "ERROR: Modified PCC build failed"
    echo '{"reward": 0.0, "error": "modified_build_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make install 2>&1; then
    echo "ERROR: Modified PCC install failed"
    echo '{"reward": 0.0, "error": "modified_install_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

# Build modified pcc-libs
echo "Building modified pcc-libs..."
cd "$PCC_LIBS_SRC"
make distclean 2>/dev/null || true

if ! ./configure --prefix="$MODIFIED_PREFIX" CC="$MODIFIED_PREFIX/bin/pcc" 2>&1; then
    echo "ERROR: Modified pcc-libs configure failed"
    echo '{"reward": 0.0, "error": "modified_libs_configure_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make 2>&1; then
    echo "ERROR: Modified pcc-libs build failed"
    echo '{"reward": 0.0, "error": "modified_libs_build_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if ! make install 2>&1; then
    echo "ERROR: Modified pcc-libs install failed"
    echo '{"reward": 0.0, "error": "modified_libs_install_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

MODIFIED_PCC_BIN="$MODIFIED_PREFIX/bin/pcc"

if [[ ! -x "$MODIFIED_PCC_BIN" ]]; then
    echo "ERROR: Modified PCC binary not found: $MODIFIED_PCC_BIN"
    echo '{"reward": 0.0, "error": "modified_binary_missing"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

echo "✓ Modified PCC built successfully"
$MODIFIED_PCC_BIN --version 2>&1 | head -3
echo ""

# Basic sanity check
echo "Verifying modified PCC basic functionality..."
echo 'int main() { return 0; }' > /tmp/verify_test.c
if ! "$MODIFIED_PCC_BIN" /tmp/verify_test.c -o /tmp/verify_test 2>&1; then
    echo "ERROR: Modified PCC cannot compile a basic program"
    echo '{"reward": 0.0, "error": "modified_basic_test_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi
if ! /tmp/verify_test; then
    echo "ERROR: Modified PCC-compiled program failed to run"
    echo '{"reward": 0.0, "error": "modified_execution_failed"}' > "$VERIFIER_DIR/reward.json"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi
rm -f /tmp/verify_test.c /tmp/verify_test
echo "✓ Modified PCC basic sanity check passed"
echo ""

# === Step 3: Run Correctness Tests ===
echo "=== Step 3: Running Correctness Tests ==="
echo ""

# Use separate directories for baseline and modified to avoid overwriting
CORRECTNESS_BASELINE_DIR="$CORRECTNESS_DIR/baseline"
CORRECTNESS_MODIFIED_DIR="$CORRECTNESS_DIR/modified"
mkdir -p "$CORRECTNESS_BASELINE_DIR" "$CORRECTNESS_MODIFIED_DIR"

# Test baseline PCC
"$SCRIPTS/correctness_tests.sh" \
    --custom "$BASELINE_PCC_BIN" \
    --custom-flags "-O" \
    --results-dir "$CORRECTNESS_BASELINE_DIR" \
    --timeout 10 \
    2>&1 || true

# Test modified PCC
"$SCRIPTS/correctness_tests.sh" \
    --custom "$MODIFIED_PCC_BIN" \
    --custom-flags "-O" \
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

# Benchmark baseline PCC
echo "Benchmarking baseline PCC..."
"$SCRIPTS/benchmark_suite.sh" \
    --compiler custom \
    --custom "$BASELINE_PCC_BIN" \
    --custom-flags "-O" \
    --suite coremark \
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

# Benchmark modified PCC
echo "Benchmarking modified PCC..."
"$SCRIPTS/benchmark_suite.sh" \
    --compiler custom \
    --custom "$MODIFIED_PCC_BIN" \
    --custom-flags "-O" \
    --suite coremark \
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
