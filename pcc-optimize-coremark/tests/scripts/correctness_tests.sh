#!/bin/bash
# Compiler Correctness Test Suite
# Tests GCC, Clang, TCC, PCC, and lacc against portable test suites
#
# Test Suites:
#   - GCC torture/execute (1,897 tests) - abort()/exit(0) validation
#   - LLVM UnitTests (100+ tests) - output comparison
#
# Usage:
#   ./correctness_tests.sh                    # Run all suites
#   ./correctness_tests.sh --suite torture    # Run only torture tests
#   ./correctness_tests.sh --suite llvm       # Run only LLVM tests
#   ./correctness_tests.sh --compiler gcc     # Test only GCC
#   ./correctness_tests.sh --quick            # Quick mode (subset of tests)
#   ./correctness_tests.sh --quick --quick-subset 1/4   # Run 1st quarter of tests
#   ./correctness_tests.sh --quick --quick-subset 2/4   # Run 2nd quarter of tests
#   ./correctness_tests.sh --timeout 5        # Set timeout per test
#
# Quick subset coverage:
#   Default --quick runs ~5% of tests (subset 1/20)
#   To run all tests across multiple invocations:
#     for i in {1..20}; do ./correctness_tests.sh --quick --quick-subset $i/20; done
#   Or use larger subsets for fewer runs:
#     ./correctness_tests.sh --quick --quick-subset 1/4  # 25% of tests

# Note: Not using set -e due to test exit codes

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$BASE_DIR/results/correctness_$(date +%Y%m%d_%H%M%S)"
TIMEOUT_SEC=5
QUICK_MODE=0
QUICK_SUBSET="1/20"  # Format: X/Y means run subset X of Y (~5% default, use 1-20/20 to cover all)
SUITE_FILTER=""
COMPILER_FILTER=""
CUSTOM_CC=""         # path to custom compiler binary
CUSTOM_FLAGS=""      # flags for custom compiler
CUSTOM_NAME="custom" # name for custom compiler in results

# Test suite locations
TORTURE_DIR="$BASE_DIR/benchmarks/gcc-torture/gcc/testsuite/gcc.c-torture/execute"
LLVM_UNIT_DIR="$BASE_DIR/benchmarks/llvm-test-suite/SingleSource/UnitTests"

# Expected failures file (documents known issues)
EXPECTED_FAILURES_FILE="$BASE_DIR/data/expected_failures.txt"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --suite|-s)       SUITE_FILTER="$2"; shift 2 ;;
        --compiler|-c)    COMPILER_FILTER="$2"; shift 2 ;;
        --custom)         CUSTOM_CC="$2"; shift 2 ;;
        --custom-flags)   CUSTOM_FLAGS="$2"; shift 2 ;;
        --quick|-q)       QUICK_MODE=1; shift ;;
        --quick-subset)   QUICK_SUBSET="$2"; shift 2 ;;
        --timeout|-t)     TIMEOUT_SEC="$2"; shift 2 ;;
        --results-dir)    RESULTS_DIR="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "  --suite NAME        Run only: torture, llvm"
            echo "  --compiler NAME     Test only: gcc, clang, tcc, pcc, lacc"
            echo "  --custom PATH       Path to custom compiler binary (tested alongside selected compilers)"
            echo "  --custom-flags FLG  Flags for custom compiler (default: none)"
            echo "  --quick             Quick mode (test subset)"
            echo "  --quick-subset X/Y  In quick mode, run subset X of Y (default: 1/20 = 5%)"
            echo "                      e.g., --quick --quick-subset 1/4 runs 1st quarter"
            echo "                      Run with 1/20 through 20/20 to cover all tests"
            echo "  --timeout SEC       Timeout per test (default: 5)"
            echo "  --results-dir DIR   Override results directory"
            exit 0 ;;
        *)                echo "Unknown: $1"; exit 1 ;;
    esac
done

mkdir -p "$RESULTS_DIR"
RESULTS_CSV="$RESULTS_DIR/results.csv"
SUMMARY_FILE="$RESULTS_DIR/summary.txt"

# Parse quick subset (X/Y format)
QUICK_SUBSET_NUM="${QUICK_SUBSET%/*}"   # X
QUICK_SUBSET_TOTAL="${QUICK_SUBSET#*/}" # Y

# Validate subset format
if ! [[ "$QUICK_SUBSET_NUM" =~ ^[0-9]+$ && "$QUICK_SUBSET_TOTAL" =~ ^[0-9]+$ ]]; then
    echo "Error: Invalid --quick-subset format. Use X/Y (e.g., 1/4)"
    exit 1
fi
if [[ "$QUICK_SUBSET_NUM" -lt 1 || "$QUICK_SUBSET_NUM" -gt "$QUICK_SUBSET_TOTAL" ]]; then
    echo "Error: --quick-subset X/Y requires 1 <= X <= Y"
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "  Compiler Correctness Test Suite"
echo "========================================"
echo "Results: $RESULTS_DIR"
echo ""

# === Compiler Detection ===
declare -A COMPILERS
declare -A COMP_FLAGS

detect_compilers() {
    local comps=("gcc" "clang" "tcc" "pcc" "lacc")
    local lacc_path="$BASE_DIR/benchmarks/lacc-src/bin/lacc"
    
    for comp in "${comps[@]}"; do
        if [[ -n "$COMPILER_FILTER" && "$comp" != "$COMPILER_FILTER" ]]; then
            continue
        fi
        
        local path=""
        case $comp in
            lacc) path="$lacc_path" ;;
            *)    path=$(command -v $comp 2>/dev/null || echo "") ;;
        esac
        
        if [[ -n "$path" && -x "$path" ]]; then
            COMPILERS[$comp]="$path"
            case $comp in
                gcc|clang) COMP_FLAGS[$comp]="-w -O0" ;;
                tcc)       COMP_FLAGS[$comp]="-w" ;;
                pcc)       COMP_FLAGS[$comp]="-w" ;;
                lacc)      COMP_FLAGS[$comp]="-w -I/usr/lib/gcc/x86_64-linux-gnu/12/include" ;;
            esac
            echo -e "  [${GREEN}OK${NC}] $comp: $path"
        else
            echo -e "  [${YELLOW}--${NC}] $comp: not found"
        fi
    done
}

echo "Detecting compilers..."
detect_compilers

# Register custom compiler if specified
if [[ -n "$CUSTOM_CC" ]]; then
    if [[ -x "$CUSTOM_CC" ]] || command -v "$CUSTOM_CC" &>/dev/null; then
        COMPILERS["$CUSTOM_NAME"]="$CUSTOM_CC"
        COMP_FLAGS["$CUSTOM_NAME"]="-w $CUSTOM_FLAGS"
        echo -e "  [${GREEN}OK${NC}] $CUSTOM_NAME: $CUSTOM_CC (flags: -w $CUSTOM_FLAGS)"
    else
        echo "ERROR: Custom compiler not found or not executable: $CUSTOM_CC"
        exit 1
    fi
fi

echo ""

if [[ ${#COMPILERS[@]} -eq 0 ]]; then
    echo "No compilers found!"
    exit 1
fi

# === CSV Header ===
echo "suite,test,compiler,result,time_ms,notes" > "$RESULTS_CSV"

# === Statistics ===
declare -A PASS_COUNT
declare -A FAIL_COUNT
declare -A COMPILE_FAIL_COUNT
declare -A SKIP_COUNT
declare -A TIMEOUT_COUNT

for comp in "${!COMPILERS[@]}"; do
    PASS_COUNT[$comp]=0
    FAIL_COUNT[$comp]=0
    COMPILE_FAIL_COUNT[$comp]=0
    SKIP_COUNT[$comp]=0
    TIMEOUT_COUNT[$comp]=0
done

# === Test Runner Functions ===

# Check if test uses GCC-specific extensions not portable to other compilers
uses_gcc_extensions() {
    local src="$1"
    # Includes: builtins, attributes, inline asm, typeof, complex, 128-bit types,
    # vector types, local labels, nested functions, case ranges (X ... Y),
    # __complex__ (GCC double-underscore form), trampolines (nested function pointer)
    grep -qE "__builtin_|__attribute__|asm\s*\(|__asm__|typeof|_Complex|__complex__|__int128|__float128|__vector|__label__|nested.*function|__extension__|__SIZEOF_|case\s+[0-9]+\s*\.\.\.|dg-require-effective-target\s+trampolines" "$src" 2>/dev/null
}

# Run a single test that uses abort()/exit(0) pattern
# Returns: 0=pass, 1=fail, 2=compile_fail, 3=timeout
run_torture_test() {
    local src="$1"
    local comp="$2"
    local cc="${COMPILERS[$comp]}"
    local flags="${COMP_FLAGS[$comp]}"
    local name=$(basename "$src" .c)
    local bin="$RESULTS_DIR/bin/${name}_${comp}"
    
    mkdir -p "$RESULTS_DIR/bin"
    
    # Compile (with timeout - some compilers hang on certain tests)
    local compile_start=$(date +%s%3N)
    if ! timeout ${TIMEOUT_SEC}s $cc $flags "$src" -o "$bin" -lm >/dev/null 2>&1; then
        return 2  # Compile failed or timed out
    fi
    local compile_end=$(date +%s%3N)
    
    # Run
    timeout ${TIMEOUT_SEC}s "$bin" >/dev/null 2>&1
    local exit_code=$?
    if [[ $exit_code -eq 0 ]]; then
        local run_end=$(date +%s%3N)
        local total_ms=$(( run_end - compile_start ))
        echo "$total_ms"
        return 0  # Pass (exit 0)
    elif [[ $exit_code -eq 124 ]]; then
        return 3  # Timeout
    else
        return 1  # Fail (abort or non-zero exit)
    fi
}

# Run a test with expected output comparison
# Returns: 0=pass, 1=fail, 2=compile_fail, 3=timeout
run_output_test() {
    local src="$1"
    local expected="$2"
    local comp="$3"
    local cc="${COMPILERS[$comp]}"
    local flags="${COMP_FLAGS[$comp]}"
    local name=$(basename "$src" .c)
    local bin="$RESULTS_DIR/bin/${name}_${comp}"
    local out="$RESULTS_DIR/out/${name}_${comp}.out"
    
    mkdir -p "$RESULTS_DIR/bin" "$RESULTS_DIR/out"
    
    # Compile (with timeout)
    if ! timeout ${TIMEOUT_SEC}s $cc $flags "$src" -o "$bin" -lm >/dev/null 2>&1; then
        return 2
    fi
    
    # Run and capture output
    timeout ${TIMEOUT_SEC}s "$bin" > "$out" 2>&1
    local exit_code=$?
    if [[ $exit_code -eq 124 ]]; then
        return 3
    fi
    # Non-zero exit but might still produce correct output
    
    # Compare output (normalize whitespace and ignore exit messages)
    local expected_clean=$(grep -vE "^exit " "$expected" 2>/dev/null | sed 's/[[:space:]]*$//' | grep -v '^$')
    local actual_clean=$(sed 's/[[:space:]]*$//' "$out" 2>/dev/null | grep -v '^$')
    
    if [[ "$expected_clean" == "$actual_clean" ]]; then
        return 0
    fi
    
    return 1
}

# Record result
record_result() {
    local suite="$1"
    local test="$2"
    local comp="$3"
    local result="$4"
    local time_ms="$5"
    local notes="$6"
    
    echo "$suite,$test,$comp,$result,$time_ms,$notes" >> "$RESULTS_CSV"
    
    case $result in
        PASS)         PASS_COUNT[$comp]=$((PASS_COUNT[$comp] + 1)) ;;
        FAIL)         FAIL_COUNT[$comp]=$((FAIL_COUNT[$comp] + 1)) ;;
        SKIP)         SKIP_COUNT[$comp]=$((SKIP_COUNT[$comp] + 1)) ;;
        TIMEOUT)      TIMEOUT_COUNT[$comp]=$((TIMEOUT_COUNT[$comp] + 1)) ;;
        COMPILE_FAIL) COMPILE_FAIL_COUNT[$comp]=$((COMPILE_FAIL_COUNT[$comp] + 1)) ;;
    esac
}

# === Suite 1: GCC Torture Tests ===
run_torture_suite() {
    echo "========================================"
    echo "  GCC Torture Tests (execute)"
    echo "========================================"
    
    if [[ ! -d "$TORTURE_DIR" ]]; then
        echo "Torture tests not found at $TORTURE_DIR"
        return
    fi
    
    # Get test list
    local tests=()
    while IFS= read -r -d '' file; do
        tests+=("$file")
    done < <(find "$TORTURE_DIR" -maxdepth 1 -name "*.c" -print0 2>/dev/null | sort -z)
    
    local total=${#tests[@]}
    
    if [[ $QUICK_MODE -eq 1 ]]; then
        # Quick mode: select subset X of Y from the full test set
        # subset 1/4 = indices 0,4,8,...  subset 2/4 = indices 1,5,9,...  etc.
        local quick_tests=()
        local offset=$((QUICK_SUBSET_NUM - 1))
        for ((i=offset; i<total; i+=QUICK_SUBSET_TOTAL)); do
            quick_tests+=("${tests[$i]}")
        done
        tests=("${quick_tests[@]}")
        total=${#tests[@]}
        echo "Quick mode: subset $QUICK_SUBSET_NUM of $QUICK_SUBSET_TOTAL"
    fi
    
    echo "Tests: $total"
    echo ""
    
    local count=0
    for src in "${tests[@]}"; do
        ((count++))
        local name=$(basename "$src" .c)
        
        printf "\r[%d/%d] %-40s" "$count" "$total" "$name"
        
        # Check for GCC extensions
        local has_extensions=0
        if uses_gcc_extensions "$src"; then
            has_extensions=1
        fi
        
        for comp in "${!COMPILERS[@]}"; do
            # Skip GCC-extension tests for non-GCC/Clang compilers
            if [[ $has_extensions -eq 1 && "$comp" != "gcc" && "$comp" != "clang" ]]; then
                record_result "torture" "$name" "$comp" "SKIP" "0" "uses_gcc_extensions"
                continue
            fi
            
            local time_ms
            time_ms=$(run_torture_test "$src" "$comp")
            local result=$?
            
            case $result in
                0) record_result "torture" "$name" "$comp" "PASS" "$time_ms" "" ;;
                1) record_result "torture" "$name" "$comp" "FAIL" "0" "runtime_fail" ;;
                2) record_result "torture" "$name" "$comp" "COMPILE_FAIL" "0" "compile_error" ;;
                3) record_result "torture" "$name" "$comp" "TIMEOUT" "0" "timeout_${TIMEOUT_SEC}s" ;;
            esac
        done
    done
    printf "\r%-60s\n" "Done."
    echo ""
}

# === Suite 2: LLVM UnitTests ===
run_llvm_suite() {
    echo "========================================"
    echo "  LLVM UnitTests"
    echo "========================================"
    
    if [[ ! -d "$LLVM_UNIT_DIR" ]]; then
        echo "LLVM UnitTests not found at $LLVM_UNIT_DIR"
        return
    fi
    
    # Get test list (only tests with reference output)
    local tests=()
    while IFS= read -r -d '' file; do
        local ref="${file%.c}.reference_output"
        if [[ -f "$ref" ]]; then
            tests+=("$file")
        fi
    done < <(find "$LLVM_UNIT_DIR" -maxdepth 1 -name "*.c" -print0 2>/dev/null | sort -z)
    
    local total=${#tests[@]}
    
    if [[ $QUICK_MODE -eq 1 ]]; then
        # Quick mode: select subset X of Y from the full test set
        local quick_tests=()
        local offset=$((QUICK_SUBSET_NUM - 1))
        for ((i=offset; i<total; i+=QUICK_SUBSET_TOTAL)); do
            quick_tests+=("${tests[$i]}")
        done
        tests=("${quick_tests[@]}")
        total=${#tests[@]}
        echo "Quick mode: subset $QUICK_SUBSET_NUM of $QUICK_SUBSET_TOTAL"
    fi
    
    echo "Tests: $total"
    echo ""
    
    local count=0
    for src in "${tests[@]}"; do
        ((count++))
        local name=$(basename "$src" .c)
        local ref="${src%.c}.reference_output"
        
        printf "\r[%d/%d] %-40s" "$count" "$total" "$name"
        
        for comp in "${!COMPILERS[@]}"; do
            run_output_test "$src" "$ref" "$comp"
            local result=$?
            
            case $result in
                0) record_result "llvm" "$name" "$comp" "PASS" "0" "" ;;
                1) record_result "llvm" "$name" "$comp" "FAIL" "0" "output_mismatch" ;;
                2) record_result "llvm" "$name" "$comp" "COMPILE_FAIL" "0" "compile_error" ;;
                3) record_result "llvm" "$name" "$comp" "TIMEOUT" "0" "timeout_${TIMEOUT_SEC}s" ;;
            esac
        done
    done
    printf "\r%-60s\n" "Done."
    echo ""
}

# === Run Suites ===
if [[ -z "$SUITE_FILTER" || "$SUITE_FILTER" == "torture" ]]; then
    run_torture_suite
fi

if [[ -z "$SUITE_FILTER" || "$SUITE_FILTER" == "llvm" ]]; then
    run_llvm_suite
fi

# === Summary ===
echo "========================================"
echo "  Summary"
echo "========================================"
echo ""

# Print summary table
printf "%-10s %8s %8s %8s %8s %8s %8s\n" "Compiler" "Pass" "Fail" "CompFail" "Skip" "Timeout" "Total"
printf "%-10s %8s %8s %8s %8s %8s %8s\n" "--------" "----" "----" "--------" "----" "-------" "-----"

for comp in $(echo "${!COMPILERS[@]}" | tr ' ' '\n' | sort); do
    pass=${PASS_COUNT[$comp]:-0}
    fail=${FAIL_COUNT[$comp]:-0}
    compfail=${COMPILE_FAIL_COUNT[$comp]:-0}
    skip=${SKIP_COUNT[$comp]:-0}
    timeout=${TIMEOUT_COUNT[$comp]:-0}
    total=$((pass + fail + compfail + skip + timeout))
    
    printf "%-10s %8d %8d %8d %8d %8d %8d\n" "$comp" "$pass" "$fail" "$compfail" "$skip" "$timeout" "$total"
done

echo ""

# Calculate pass rates
echo "Pass Rates (Pass / (Pass + Fail)):"
for comp in $(echo "${!COMPILERS[@]}" | tr ' ' '\n' | sort); do
    pass=${PASS_COUNT[$comp]:-0}
    fail=${FAIL_COUNT[$comp]:-0}
    tested=$((pass + fail))
    if [[ $tested -gt 0 ]]; then
        rate=$(awk "BEGIN {printf \"%.1f\", $pass * 100 / $tested}")
        echo "  $comp: ${rate}% ($pass/$tested tests passed)"
    else
        echo "  $comp: N/A (no tests ran)"
    fi
done

echo ""

# Analyze failures against expected failures file
echo "Failure Analysis:"
if [[ -f "$EXPECTED_FAILURES_FILE" ]]; then
    for comp in $(echo "${!COMPILERS[@]}" | tr ' ' '\n' | sort); do
        # Get actual failures from CSV (both runtime FAIL and COMPILE_FAIL)
        actual_failures=$(grep ",$comp,FAIL,\|,$comp,COMPILE_FAIL," "$RESULTS_CSV" 2>/dev/null | cut -d, -f2 | sort | tr '\n' ' ')
        # Get expected failures from file
        expected_failures=$(grep "^$comp:" "$EXPECTED_FAILURES_FILE" 2>/dev/null | cut -d: -f2 | sort | tr '\n' ' ')
        # Get all tests that were run for this compiler (PASS, FAIL, or COMPILE_FAIL)
        tests_run=$(grep ",$comp," "$RESULTS_CSV" 2>/dev/null | grep -E ",PASS,|,FAIL,|,COMPILE_FAIL," | cut -d, -f2 | sort | tr '\n' ' ')
        
        # Count using word count
        actual_count=$(echo "$actual_failures" | wc -w)
        
        # Find unexpected failures (in actual but not in expected)
        unexpected=""
        for f in $actual_failures; do
            if ! echo " $expected_failures " | grep -q " $f "; then
                unexpected="$unexpected $f"
            fi
        done
        unexpected_count=$(echo "$unexpected" | wc -w)
        
        # Find regressions fixed - tests that were expected to fail but now pass
        # (only count if the test was actually run)
        fixed=""
        for f in $expected_failures; do
            # Check if test was run AND is not in actual failures (meaning it passed)
            if echo " $tests_run " | grep -q " $f " && ! echo " $actual_failures " | grep -q " $f "; then
                fixed="$fixed $f"
            fi
        done
        fixed_count=$(echo "$fixed" | wc -w)
        
        if [[ $actual_count -eq 0 ]]; then
            echo "  $comp: No failures"
        elif [[ $unexpected_count -eq 0 && $fixed_count -eq 0 ]]; then
            echo "  $comp: $actual_count failures (all expected)"
        else
            expected_matched=$((actual_count - unexpected_count))
            echo "  $comp: $actual_count failures ($expected_matched expected, $unexpected_count unexpected)"
            if [[ $unexpected_count -gt 0 ]]; then
                echo "    Unexpected:$unexpected"
            fi
            if [[ $fixed_count -gt 0 ]]; then
                echo "    Now passing:$fixed"
            fi
        fi
    done
    echo ""
    echo "Expected failures documented in: $EXPECTED_FAILURES_FILE"
else
    echo "  (Expected failures file not found: $EXPECTED_FAILURES_FILE)"
fi

echo ""
echo "Results CSV: $RESULTS_CSV"

# Save summary
{
    echo "Compiler Correctness Test Results"
    echo "================================="
    echo "Date: $(date)"
    echo "Timeout: ${TIMEOUT_SEC}s"
    echo ""
    for comp in $(echo "${!COMPILERS[@]}" | tr ' ' '\n' | sort); do
        echo "$comp: Pass=${PASS_COUNT[$comp]} Fail=${FAIL_COUNT[$comp]} CompFail=${COMPILE_FAIL_COUNT[$comp]} Skip=${SKIP_COUNT[$comp]} Timeout=${TIMEOUT_COUNT[$comp]}"
    done
} > "$SUMMARY_FILE"

# Cleanup
rm -rf "$RESULTS_DIR/bin" "$RESULTS_DIR/out" 2>/dev/null

echo "========================================"
