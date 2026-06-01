#!/bin/bash
# Compiler Benchmark Suite
# Tests GCC, Clang, TCC, PCC, and lacc across CoreMark, LLVM SingleSource, and PolyBench
#
# Usage:
#   ./benchmark_suite.sh                    # Run all suites, 3 iterations
#   ./benchmark_suite.sh --quick            # Quick mode: 1 iteration
#   ./benchmark_suite.sh -n 5               # 5 iterations
#   ./benchmark_suite.sh --verify           # Enable correctness verification
#   ./benchmark_suite.sh --suite llvm       # Run only LLVM suite
#   ./benchmark_suite.sh --suite coremark,polybench  # Run CoreMark and PolyBench
#   ./benchmark_suite.sh --sample 5         # Run only 5 benchmarks per suite
#   ./benchmark_suite.sh --compiler gcc,tcc # Test only GCC and TCC
#
# Suites: coremark, llvm, polybench (or 'all')
#
# Verification Notes:
#   - Only LLVM benchmarks with deterministic stdout output are verified
#   - Benchmarks that print timing/performance data are skipped
#   - PolyBench and CoreMark produce timing output, so verification is skipped

set -e

# === Configuration ===
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RESULTS_DIR="$BASE_DIR/results/suite_$(date +%Y%m%d_%H%M%S)"
TIMEOUT_SEC=120
ITERATIONS=3
VERIFY=0
SAMPLE_SIZE=0        # 0 = run all benchmarks
SUITES="all"         # coremark,llvm,polybench or 'all'
COMPILER_FILTER=""   # empty = all compilers
CUSTOM_CC=""         # path to custom compiler binary
CUSTOM_FLAGS=""      # flags for custom compiler
CUSTOM_NAME="custom" # name for custom compiler in results

# Benchmarks that DON'T produce verifiable output (timing data, stderr, or nothing meaningful)
declare -A NO_VERIFY_BENCHMARKS=(
    ["dhrystone"]=1    # Prints performance stats (DMIPS, timing)
    ["whetstone"]=1    # Prints only a newline (no meaningful output)
    ["linpack"]=1      # Outputs to stderr, not stdout
    ["flops"]=1        # Prints performance stats (MFLOPS)
    ["fbench"]=1       # Prints timing statistics
    ["ffbench"]=1      # Prints timing statistics
)

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick|-q)       ITERATIONS=1; shift ;;
        -n)               ITERATIONS="$2"; shift 2 ;;
        --verify|-v)      VERIFY=1; shift ;;
        --suite|-s)       SUITES="$2"; shift 2 ;;
        --sample)         SAMPLE_SIZE="$2"; shift 2 ;;
        --compiler|-c)    COMPILER_FILTER="$2"; shift 2 ;;
        --custom)         CUSTOM_CC="$2"; shift 2 ;;
        --custom-flags)   CUSTOM_FLAGS="$2"; shift 2 ;;
        --timeout|-t)     TIMEOUT_SEC="$2"; shift 2 ;;
        --results-dir)    RESULTS_DIR="$2"; shift 2 ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --quick, -q         Quick mode (1 iteration)"
            echo "  -n N                Number of iterations (default: 3)"
            echo "  --verify, -v        Enable correctness verification"
            echo "  --suite, -s SUITES  Comma-separated: coremark,llvm,polybench or 'all'"
            echo "  --sample N          Run only N benchmarks per suite (0=all)"
            echo "  --compiler, -c LIST Comma-separated: gcc,clang,tcc,pcc,lacc"
            echo "  --custom PATH       Path to custom compiler binary (tested alongside selected compilers)"
            echo "  --custom-flags FLG  Flags for custom compiler (default: none)"
            echo "  --timeout, -t SEC   Timeout per benchmark (default: 120)"
            echo "  --results-dir DIR   Override results directory"
            echo ""
            echo "Examples:"
            echo "  $0 --quick --suite llvm           # Quick LLVM-only run"
            echo "  $0 --suite coremark,polybench     # CoreMark + PolyBench"
            echo "  $0 --sample 3 --compiler gcc,tcc  # 3 benchmarks, GCC vs TCC"
            echo "  $0 --custom /path/to/cc --custom-flags '-O2' --compiler gcc"
            exit 0 ;;
        *)                echo "Unknown: $1"; exit 1 ;;
    esac
done

# Helper: check if suite is enabled
suite_enabled() {
    local suite=$1
    [[ "$SUITES" == "all" ]] || [[ ",$SUITES," == *",$suite,"* ]]
}

mkdir -p "$RESULTS_DIR"
RESULTS_CSV="$RESULTS_DIR/results.csv"

echo "========================================"
echo "  Compiler Benchmark Suite"
echo "========================================"
echo "Iterations: $ITERATIONS"
echo "Suites: $SUITES"
[ $SAMPLE_SIZE -gt 0 ] && echo "Sample: $SAMPLE_SIZE benchmarks per suite"
echo "Verify: $([ $VERIFY -eq 1 ] && echo 'YES' || echo 'NO')"
echo "Timeout: ${TIMEOUT_SEC}s"
echo "Results: $RESULTS_DIR"
echo ""

# === Compilers ===
declare -A COMPILERS=(
    ["gcc"]="gcc"
    ["clang"]="clang"
    ["tcc"]="tcc"
    ["pcc"]="pcc"
    ["lacc"]="$BASE_DIR/benchmarks/lacc-src/bin/lacc"
)

declare -A OPT_LEVELS=(
    ["gcc"]="-O3"
    ["clang"]="-O3"
    ["tcc"]=""
    ["pcc"]="-O"
    ["lacc"]="-O3"
)

# Register custom compiler if specified
if [[ -n "$CUSTOM_CC" ]]; then
    if [ -x "$CUSTOM_CC" ] || command -v "$CUSTOM_CC" &>/dev/null; then
        COMPILERS["$CUSTOM_NAME"]="$CUSTOM_CC"
        OPT_LEVELS["$CUSTOM_NAME"]="$CUSTOM_FLAGS"
    else
        echo "ERROR: Custom compiler not found or not executable: $CUSTOM_CC"
        exit 1
    fi
fi

# Only treat entries with a '/' as file paths. For bare names like "tcc",
# resolve via PATH only (avoids accidentally picking up a local ./tcc).
is_compiler_available() {
    local spec="$1"
    if [[ "$spec" == *"/"* ]]; then
        [[ -x "$spec" ]]
    else
        command -v "$spec" &>/dev/null
    fi
}

# Check available compilers (and apply filter)
echo "Compilers:"
for name in "${!COMPILERS[@]}"; do
    # Custom compiler bypasses the filter (always included when specified)
    if [[ "$name" != "$CUSTOM_NAME" ]]; then
        # Check if compiler is in filter (if filter is set)
        if [[ -n "$COMPILER_FILTER" && ",$COMPILER_FILTER," != *",$name,"* ]]; then
            unset COMPILERS[$name]
            continue
        fi
    fi
    
    if is_compiler_available "${COMPILERS[$name]}"; then
        if [[ "$name" == "$CUSTOM_NAME" ]]; then
            echo "  [OK] $name (${COMPILERS[$name]} ${OPT_LEVELS[$name]})"
        else
            echo "  [OK] $name"
        fi
    else
        echo "  [--] $name (not found)"
        unset COMPILERS[$name]
    fi
done
echo ""

# === CSV Header ===
if [ $VERIFY -eq 1 ]; then
    echo "suite,benchmark,compiler,opt,compile_sec,size_bytes,runtime_sec,status,correct" > "$RESULTS_CSV"
    mkdir -p "$RESULTS_DIR/ref"
else
    echo "suite,benchmark,compiler,opt,compile_sec,size_bytes,runtime_sec,status" > "$RESULTS_CSV"
fi

PASS_COUNT=0
FAIL_COUNT=0

# === Core Functions ===

# Generate reference output using GCC -O0
gen_ref() {
    local suite=$1 name=$2 src=$3 flags=$4
    local ref_out="$RESULTS_DIR/ref/${suite}_${name}.out"
    [ -f "$ref_out" ] && return 0
    
    local ref_bin="$RESULTS_DIR/ref/${suite}_${name}"
    if gcc -w -O0 $flags $src -o "$ref_bin" -lm 2>/dev/null; then
        timeout 30s "$ref_bin" > "$ref_out" 2>&1 || rm -f "$ref_out"
    fi
}

# Compile and run a benchmark
# $7 (do_verify) - 1 if this specific benchmark should be verified, 0 otherwise
run_bench() {
    local suite=$1 name=$2 src=$3 flags=$4 comp=$5 opt=$6 do_verify=${7:-0}
    local cc="${COMPILERS[$comp]}"
    local label="${comp}${opt:+ $opt}"
    local opt_clean="${opt//-/}"
    local bin="$RESULTS_DIR/${suite}_${name}_${comp}_${opt_clean}"
    local out="$RESULTS_DIR/${suite}_${name}_${comp}_${opt_clean}.out"
    local ref="$RESULTS_DIR/ref/${suite}_${name}.out"
    
    printf "  %-12s " "$label"
    
    # Compile
    local t0=$(date +%s.%N)
    local compile_ok=0
    
    if [ "$comp" = "pcc" ]; then
        $cc $opt $flags $src -o "$bin" -lm 2>/dev/null && compile_ok=1
    elif [ "$comp" = "lacc" ]; then
        $cc -I/usr/lib/gcc/x86_64-linux-gnu/12/include $opt $flags $src -o "$bin" -lm >/dev/null 2>&1 && compile_ok=1
    else
        $cc -w $opt $flags $src -o "$bin" -lm 2>/dev/null && compile_ok=1
    fi
    
    local t1=$(date +%s.%N)
    local ct=$(echo "$t1 - $t0" | bc)
    
    if [ $compile_ok -eq 0 ]; then
        echo "COMPILE FAILED"
        [ $VERIFY -eq 1 ] && echo "$suite,$name,$comp,$opt,$ct,0,0,FAIL,N/A" >> "$RESULTS_CSV" \
                          || echo "$suite,$name,$comp,$opt,$ct,0,0,FAIL" >> "$RESULTS_CSV"
        return
    fi
    
    local sz=$(stat --printf="%s" "$bin" 2>/dev/null || echo 0)
    
    # Run benchmark
    local total=0 runs=0 correct="N/A"
    
    for ((i=1; i<=ITERATIONS; i++)); do
        local s=$(date +%s.%N)
        
        if [ $i -eq 1 ] && [ $do_verify -eq 1 ]; then
            # First iteration with verification: capture output
            if timeout ${TIMEOUT_SEC}s "$bin" > "$out" 2>&1; then
                local e=$(date +%s.%N)
                total=$(echo "$total + $e - $s" | bc)
                runs=$((runs + 1))
                
                if [ -f "$ref" ]; then
                    if numdiff -a 1e-6 -q "$ref" "$out" >/dev/null 2>&1; then
                        correct="PASS"
                        PASS_COUNT=$((PASS_COUNT + 1))
                    else
                        correct="FAIL"
                        FAIL_COUNT=$((FAIL_COUNT + 1))
                    fi
                fi
            else
                break
            fi
        else
            # No verification or subsequent iterations: discard output
            if timeout ${TIMEOUT_SEC}s "$bin" >/dev/null 2>&1; then
                local e=$(date +%s.%N)
                total=$(echo "$total + $e - $s" | bc)
                runs=$((runs + 1))
            else
                break
            fi
        fi
    done
    
    if [ $runs -gt 0 ]; then
        local rt=$(echo "scale=4; $total / $runs" | bc)
        if [ $VERIFY -eq 1 ]; then
            if [ "$correct" = "FAIL" ]; then
                printf "ct=%.3fs sz=%6d rt=%.4fs \e[31m%s\e[0m\n" "$ct" "$sz" "$rt" "$correct"
            elif [ "$correct" = "PASS" ]; then
                printf "ct=%.3fs sz=%6d rt=%.4fs \e[32m%s\e[0m\n" "$ct" "$sz" "$rt" "$correct"
            else
                # N/A - benchmark doesn't support verification
                printf "ct=%.3fs sz=%6d rt=%.4fs \e[33m%s\e[0m\n" "$ct" "$sz" "$rt" "$correct"
            fi
            echo "$suite,$name,$comp,$opt,$ct,$sz,$rt,OK,$correct" >> "$RESULTS_CSV"
        else
            printf "ct=%.3fs sz=%6d rt=%.4fs\n" "$ct" "$sz" "$rt"
            echo "$suite,$name,$comp,$opt,$ct,$sz,$rt,OK" >> "$RESULTS_CSV"
        fi
    else
        echo "TIMEOUT"
        [ $VERIFY -eq 1 ] && echo "$suite,$name,$comp,$opt,$ct,$sz,0,TIMEOUT,N/A" >> "$RESULTS_CSV" \
                          || echo "$suite,$name,$comp,$opt,$ct,$sz,0,TIMEOUT" >> "$RESULTS_CSV"
    fi
}

# Check if benchmark supports verification
can_verify() {
    local name=$1
    [ -z "${NO_VERIFY_BENCHMARKS[$name]}" ]
}

# Run all compilers on a benchmark
run_all() {
    local suite=$1 name=$2 src=$3 flags=$4
    local do_verify=0
    
    # Only verify if --verify flag set AND benchmark produces verifiable output
    if [ $VERIFY -eq 1 ] && can_verify "$name"; then
        do_verify=1
        gen_ref "$suite" "$name" "$src" "$flags"
    fi
    
    for comp in gcc clang tcc pcc lacc custom; do
        [ -z "${COMPILERS[$comp]}" ] && continue
        local opt="${OPT_LEVELS[$comp]}"
        run_bench "$suite" "$name" "$src" "$flags" "$comp" "$opt" "$do_verify"
    done
}

# === SUITE 0: CoreMark ===
COREMARK_DIR="$BASE_DIR/benchmarks/coremark"

if suite_enabled "coremark"; then
    echo "========================================"
    echo "  CoreMark Benchmark"
    echo "========================================"
    
    # CoreMark iterations - use fewer for quick mode
    COREMARK_ITERS=$((ITERATIONS * 3000))
    [ $COREMARK_ITERS -lt 1000 ] && COREMARK_ITERS=1000
    
    run_coremark() {
        local comp=$1
        local opt="${OPT_LEVELS[$comp]}"
        local cc="${COMPILERS[$comp]}"
        local label="${comp}${opt:+ $opt}"
        local extra_flags=""
        
        [ -z "$cc" ] && return
        
        # lacc needs GCC include path for system headers
        if [ "$comp" = "lacc" ]; then
            extra_flags="-I/usr/lib/gcc/x86_64-linux-gnu/12/include"
        fi
        
        printf "  %-12s " "$label"
        
        # Clean previous build
        (cd "$COREMARK_DIR" && rm -f coremark.exe >/dev/null 2>&1)
        
        # Compile with make
        local t0=$(date +%s.%N)
        local compile_ok=0
        
        if (cd "$COREMARK_DIR" && make CC="$cc" PORT_CFLAGS="$opt $extra_flags" PORT_DIR=linux ITERATIONS=$COREMARK_ITERS link >/dev/null 2>&1); then
            compile_ok=1
        fi
        
        local t1=$(date +%s.%N)
        local ct=$(echo "$t1 - $t0" | bc)
        
        if [ $compile_ok -eq 0 ]; then
            echo "COMPILE FAILED"
            [ $VERIFY -eq 1 ] && echo "coremark,coremark,$comp,$opt,$ct,0,0,FAIL,N/A" >> "$RESULTS_CSV" \
                              || echo "coremark,coremark,$comp,$opt,$ct,0,0,FAIL" >> "$RESULTS_CSV"
            return
        fi
        
        local sz=$(stat --printf="%s" "$COREMARK_DIR/coremark.exe" 2>/dev/null || echo 0)
        
        # Run CoreMark and extract score
        local output
        output=$("$COREMARK_DIR/coremark.exe" 0x0 0x0 0x66 $COREMARK_ITERS 7 1 2000 2>&1)
        local score=$(echo "$output" | grep "Iterations/Sec" | awk '{print $NF}')
        
        if [ -n "$score" ]; then
            printf "ct=%.3fs sz=%6d score=%.1f iter/s\n" "$ct" "$sz" "$score"
            [ $VERIFY -eq 1 ] && echo "coremark,coremark,$comp,$opt,$ct,$sz,$score,OK,N/A" >> "$RESULTS_CSV" \
                              || echo "coremark,coremark,$comp,$opt,$ct,$sz,$score,OK" >> "$RESULTS_CSV"
        else
            echo "RUN FAILED"
            [ $VERIFY -eq 1 ] && echo "coremark,coremark,$comp,$opt,$ct,$sz,0,FAIL,N/A" >> "$RESULTS_CSV" \
                              || echo "coremark,coremark,$comp,$opt,$ct,$sz,0,FAIL" >> "$RESULTS_CSV"
        fi
    }
    
    if [ -d "$COREMARK_DIR" ]; then
        echo ""
        echo "[1/1] coremark (${COREMARK_ITERS} iterations)"
        for comp in gcc clang tcc pcc lacc custom; do
            run_coremark "$comp"
        done
        # Clean up
        (cd "$COREMARK_DIR" && rm -f coremark.exe >/dev/null 2>&1)
    else
        echo "CoreMark not found at $COREMARK_DIR - skipping"
    fi
fi

# === SUITE 1: LLVM SingleSource ===
LLVM_DIR="$BASE_DIR/benchmarks/llvm-test-suite/SingleSource/Benchmarks"

if suite_enabled "llvm"; then
    echo ""
    echo "========================================"
    echo "  LLVM SingleSource Benchmarks"
    echo "========================================"
    
    declare -A LLVM_BENCH=(
        # Shootout
        ["ackermann"]="Shootout/ackermann.c"
        ["fib2"]="Shootout/fib2.c"
        ["heapsort"]="Shootout/heapsort.c"
        ["sieve"]="Shootout/sieve.c"
        ["nestedloop"]="Shootout/nestedloop.c"
        ["matrix"]="Shootout/matrix.c"
        ["ary3"]="Shootout/ary3.c"
        ["hash"]="Shootout/hash.c"
        ["random"]="Shootout/random.c"
        ["strcat"]="Shootout/strcat.c"
        ["fannkuch"]="BenchmarkGame/fannkuch.c"
        # Stanford
        ["queens"]="Stanford/Queens.c"
        ["quicksort"]="Stanford/Quicksort.c"
        ["bubblesort"]="Stanford/Bubblesort.c"
        ["towers"]="Stanford/Towers.c"
        ["intmm"]="Stanford/IntMM.c"
        ["floatmm"]="Stanford/FloatMM.c"
        ["treesort"]="Stanford/Treesort.c"
        ["perm"]="Stanford/Perm.c"
        ["puzzle"]="Stanford/Puzzle.c"
        ["oscar"]="Stanford/Oscar.c"
        # Classic
        ["dhrystone"]="Dhrystone/dry.c"
        ["whetstone"]="Misc/whetstone.c"
        ["linpack"]="Linpack/linpack-pc.c"
        # Misc
        ["fbench"]="Misc/fbench.c"
        ["ffbench"]="Misc/ffbench.c"
        ["pi"]="Misc/pi.c"
        ["flops"]="Misc/flops.c"
    )
    
    # Get sorted benchmark names, optionally sample
    bench_names=($(echo "${!LLVM_BENCH[@]}" | tr ' ' '\n' | sort))
    total=${#bench_names[@]}
    
    # Apply sampling if requested
    if [ $SAMPLE_SIZE -gt 0 ] && [ $SAMPLE_SIZE -lt $total ]; then
        # Take evenly spaced samples
        step=$((total / SAMPLE_SIZE))
        sampled=()
        for ((i=0; i<total && ${#sampled[@]}<SAMPLE_SIZE; i+=step)); do
            sampled+=("${bench_names[$i]}")
        done
        bench_names=("${sampled[@]}")
        total=${#bench_names[@]}
        echo "(sampled $total benchmarks)"
    fi
    
    cur=0
    for name in "${bench_names[@]}"; do
        ((++cur))
        src="$LLVM_DIR/${LLVM_BENCH[$name]}"
        
        if [ ! -f "$src" ]; then
            echo "[$cur/$total] $name - SKIP"
            continue
        fi
        
        echo ""
        echo "[$cur/$total] $name"
        run_all "llvm" "$name" "$src" ""
    done
fi

# === SUITE 2: PolyBench ===
POLY_DIR="$BASE_DIR/benchmarks/polybench"

if suite_enabled "polybench"; then
    echo ""
    echo "========================================"
    echo "  PolyBench Kernels"
    echo "========================================"
    
    # Note: We do NOT use -DPOLYBENCH_TIME since we measure externally
    POLY_FLAGS="-I$POLY_DIR/utilities"
    
    declare -A POLY_BENCH=(
        ["gemm"]="linear-algebra/blas/gemm/gemm.c"
        ["gemver"]="linear-algebra/blas/gemver/gemver.c"
        ["syrk"]="linear-algebra/blas/syrk/syrk.c"
        ["2mm"]="linear-algebra/kernels/2mm/2mm.c"
        ["3mm"]="linear-algebra/kernels/3mm/3mm.c"
        ["atax"]="linear-algebra/kernels/atax/atax.c"
        ["bicg"]="linear-algebra/kernels/bicg/bicg.c"
        ["mvt"]="linear-algebra/kernels/mvt/mvt.c"
        ["cholesky"]="linear-algebra/solvers/cholesky/cholesky.c"
        ["lu"]="linear-algebra/solvers/lu/lu.c"
        ["jacobi-1d"]="stencils/jacobi-1d/jacobi-1d.c"
        ["jacobi-2d"]="stencils/jacobi-2d/jacobi-2d.c"
        ["heat-3d"]="stencils/heat-3d/heat-3d.c"
        ["floyd-warshall"]="medley/floyd-warshall/floyd-warshall.c"
        ["nussinov"]="medley/nussinov/nussinov.c"
    )
    
    # Custom runner for PolyBench (skips verification - outputs nothing verifiable)
    run_poly() {
        local name=$1 src=$2 flags=$3
        
        for comp in gcc clang tcc pcc lacc custom; do
            [ -z "${COMPILERS[$comp]}" ] && continue
            local opt="${OPT_LEVELS[$comp]}"
            local cc="${COMPILERS[$comp]}"
            local label="${comp}${opt:+ $opt}"
            local opt_clean="${opt//-/}"
            local bin="$RESULTS_DIR/poly_${name}_${comp}_${opt_clean}"
            
            printf "  %-12s " "$label"
            
            # Compile
            local t0=$(date +%s.%N)
            local compile_ok=0
            
            if [ "$comp" = "pcc" ]; then
                $cc $opt $flags $src -o "$bin" -lm 2>/dev/null && compile_ok=1
            elif [ "$comp" = "lacc" ]; then
                $cc -I/usr/lib/gcc/x86_64-linux-gnu/12/include $opt $flags $src -o "$bin" -lm >/dev/null 2>&1 && compile_ok=1
            else
                $cc -w $opt $flags $src -o "$bin" -lm 2>/dev/null && compile_ok=1
            fi
            
            local t1=$(date +%s.%N)
            local ct=$(echo "$t1 - $t0" | bc)
            
            if [ $compile_ok -eq 0 ]; then
                echo "COMPILE FAILED"
                [ $VERIFY -eq 1 ] && echo "polybench,$name,$comp,$opt,$ct,0,0,FAIL,N/A" >> "$RESULTS_CSV" \
                                  || echo "polybench,$name,$comp,$opt,$ct,0,0,FAIL" >> "$RESULTS_CSV"
                continue
            fi
            
            local sz=$(stat --printf="%s" "$bin" 2>/dev/null || echo 0)
            
            # Run
            local total=0 runs=0
            for ((i=1; i<=ITERATIONS; i++)); do
                local s=$(date +%s.%N)
                if timeout ${TIMEOUT_SEC}s "$bin" >/dev/null 2>&1; then
                    local e=$(date +%s.%N)
                    total=$(echo "$total + $e - $s" | bc)
                    runs=$((runs + 1))
                else
                    break
                fi
            done
            
            if [ $runs -gt 0 ]; then
                local rt=$(echo "scale=4; $total / $runs" | bc)
                printf "ct=%.3fs sz=%6d rt=%.4fs\n" "$ct" "$sz" "$rt"
                [ $VERIFY -eq 1 ] && echo "polybench,$name,$comp,$opt,$ct,$sz,$rt,OK,N/A" >> "$RESULTS_CSV" \
                                  || echo "polybench,$name,$comp,$opt,$ct,$sz,$rt,OK" >> "$RESULTS_CSV"
            else
                echo "TIMEOUT"
                [ $VERIFY -eq 1 ] && echo "polybench,$name,$comp,$opt,$ct,$sz,0,TIMEOUT,N/A" >> "$RESULTS_CSV" \
                                  || echo "polybench,$name,$comp,$opt,$ct,$sz,0,TIMEOUT" >> "$RESULTS_CSV"
            fi
        done
    }
    
    # Get sorted benchmark names, optionally sample
    poly_names=($(echo "${!POLY_BENCH[@]}" | tr ' ' '\n' | sort))
    total=${#poly_names[@]}
    
    # Apply sampling if requested
    if [ $SAMPLE_SIZE -gt 0 ] && [ $SAMPLE_SIZE -lt $total ]; then
        step=$((total / SAMPLE_SIZE))
        sampled=()
        for ((i=0; i<total && ${#sampled[@]}<SAMPLE_SIZE; i+=step)); do
            sampled+=("${poly_names[$i]}")
        done
        poly_names=("${sampled[@]}")
        total=${#poly_names[@]}
        echo "(sampled $total benchmarks)"
    fi
    
    cur=0
    for name in "${poly_names[@]}"; do
        ((++cur))
        src="$POLY_DIR/${POLY_BENCH[$name]}"
        
        if [ ! -f "$src" ]; then
            echo "[$cur/$total] $name - SKIP"
            continue
        fi
        
        bench_dir=$(dirname "$src")
        all_src="$src $POLY_DIR/utilities/polybench.c"
        
        echo ""
        echo "[$cur/$total] $name"
        run_poly "$name" "$all_src" "$POLY_FLAGS -I$bench_dir"
    done
fi

# === Summary ===
echo ""
echo "========================================"
echo "  Summary"
echo "========================================"
echo ""
echo "Results: $RESULTS_CSV"

total_ok=$(grep -c ",OK" "$RESULTS_CSV" 2>/dev/null | tr -d '\n' || echo 0)
total_fail=$(grep -c ",FAIL" "$RESULTS_CSV" 2>/dev/null | tr -d '\n' || echo 0)
total_timeout=$(grep -c ",TIMEOUT" "$RESULTS_CSV" 2>/dev/null | tr -d '\n' || echo 0)

# Ensure variables are valid integers
total_ok=${total_ok:-0}
total_fail=${total_fail:-0}
total_timeout=${total_timeout:-0}

echo "Runs: $((total_ok + total_fail + total_timeout))"
echo "  OK: $total_ok"
echo "  Failed: $total_fail"
echo "  Timeout: $total_timeout"

if [ $VERIFY -eq 1 ]; then
    # Count N/A (skipped) verifications
    na_count=$(grep -c ",N/A$" "$RESULTS_CSV" 2>/dev/null || echo 0)
    
    echo ""
    echo "Verification Results:"
    echo -e "  \e[32mPASS\e[0m: $PASS_COUNT"
    echo -e "  \e[31mFAIL\e[0m: $FAIL_COUNT"
    echo -e "  \e[33mN/A\e[0m:  $na_count (benchmarks that don't produce verifiable output)"
    
    echo ""
    echo "Skipped verification for: ${!NO_VERIFY_BENCHMARKS[*]} (timing/perf output)"
    echo "PolyBench benchmarks are also skipped (no stdout output)"
    
    if [ $FAIL_COUNT -gt 0 ]; then
        echo ""
        echo "Failed verifications:"
        grep ",FAIL$" "$RESULTS_CSV" 2>/dev/null | cut -d',' -f1-4 | while IFS=',' read -r s b c o; do
            echo "  $s/$b: $c $o"
        done
    fi
fi

echo ""
echo "Analyze with: python3 scripts/analyze_suite.py $RESULTS_CSV"
echo "========================================"
