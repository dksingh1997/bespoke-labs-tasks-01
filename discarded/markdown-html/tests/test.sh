#!/bin/bash
#
# Harbor verifier for the CommonMark Markdown-to-HTML task (C implementation).
#
# 1. Compile agent's C code
# 2. Anti-cheat: scan for use of existing markdown libraries/tools
# 3. Run correctness tests (visible + hidden JSON test cases)
# 4. Run performance benchmarks (agent vs cmark on large documents)
# 5. Compute weighted composite reward:
#      50% correctness (fraction of tests passed)
#      50% performance (speed vs cmark reference implementation)
#

set -euo pipefail

VERIFIER_DIR="/logs/verifier"
mkdir -p "$VERIFIER_DIR"

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

echo "========================================"
echo "  CommonMark Markdown-to-HTML Verifier"
echo "========================================"
echo "Start time: $(date)"
echo ""

# Snapshot the agent's workspace
SNAPSHOT_DIR="$VERIFIER_DIR/workspace_snapshot"
if [ -d /app/workspace ]; then
    mkdir -p "$SNAPSHOT_DIR"
    cp -r /app/workspace/* "$SNAPSHOT_DIR/" 2>/dev/null || true
    echo "Workspace snapshot saved to $SNAPSHOT_DIR"
    echo ""
fi

VISIBLE_CASES_DIR="/app/test-suite"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HIDDEN_CASES_DIR="$SCRIPT_DIR/hidden_cases"
PERF_DATA_DIR="$SCRIPT_DIR/perf_data"
MD2HTML="/app/workspace/md2html"
CMARK="/app/verifier_tools/cmark_install/bin/cmark"

# ------------------------------------------------------------------
# Step 1: Compilation
# ------------------------------------------------------------------
echo "=== Compilation ==="
COMPILE_OK=0

if [ -f /app/workspace/Makefile ]; then
    echo "Found Makefile, running make..."
    if make -C /app/workspace 2>&1 | tail -20; then
        COMPILE_OK=1
    fi
fi

if [ "$COMPILE_OK" -eq 0 ] && ls /app/workspace/*.c >/dev/null 2>&1; then
    echo "Make failed or no Makefile; trying gcc directly..."
    if gcc -O2 -Wall -std=c11 -o /app/workspace/md2html /app/workspace/*.c -lm 2>&1 | tail -20; then
        COMPILE_OK=1
    fi
fi

if [ "$COMPILE_OK" -eq 0 ] || [ ! -x "$MD2HTML" ]; then
    echo ""
    echo "Compilation FAILED. No executable at $MD2HTML. Score = 0."
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    python3 -c "
import json
reward = {'composite_score': 0.0, 'error': 'compilation_failed'}
with open('$VERIFIER_DIR/reward.json', 'w') as f:
    json.dump(reward, f, indent=2)
print(json.dumps(reward, indent=2))
"
    exit 0
fi
echo "Compilation succeeded: $MD2HTML"
echo ""

# ------------------------------------------------------------------
# Step 2: Anti-cheat
# ------------------------------------------------------------------
echo "=== Anti-cheat Check ==="
CHEAT_DETECTED=0

if [ -d /app/workspace ]; then
    # Ban #include of known markdown libraries
    if grep -rE '#include\s*[<"].*\b(cmark|libmarkdown|sundown|hoedown|md4c|discount|mkdio)\b' \
        /app/workspace/ --include="*.c" --include="*.h" -l 2>/dev/null; then
        echo "CHEAT: Found #include of a known Markdown parsing library"
        CHEAT_DETECTED=1
    fi

    # Ban system()/popen()/exec*() calling known tools
    if grep -rE '\b(system|popen|execvp?|execl|execlp)\s*\(' /app/workspace/ --include="*.c" --include="*.h" -l 2>/dev/null; then
        if grep -rE '\b(system|popen|execvp?|execl|execlp)\s*\(.*\b(cmark|pandoc|python|node|perl|ruby|markdown)\b' \
            /app/workspace/ --include="*.c" --include="*.h" -l 2>/dev/null; then
            echo "CHEAT: Found system()/popen()/exec() call to external tool"
            CHEAT_DETECTED=1
        fi
    fi

    # Ban linking against markdown libraries in Makefile
    if grep -rE '\-l(cmark|markdown|sundown|hoedown|md4c|discount)' \
        /app/workspace/ --include="Makefile" --include="*.mk" -l 2>/dev/null; then
        echo "CHEAT: Found linking against a Markdown library in build files"
        CHEAT_DETECTED=1
    fi

    # Ban Python/JS/shell wrapper files
    for wrapper in md2html.py md2html.js md2html.sh md2html.rb md2html.pl; do
        if [ -f "/app/workspace/$wrapper" ]; then
            echo "CHEAT: Found wrapper script $wrapper — converter must be written in C"
            CHEAT_DETECTED=1
        fi
    done

    # Check if the binary is actually an ELF executable (not a shell script)
    if file "$MD2HTML" 2>/dev/null | grep -qv "ELF"; then
        if file "$MD2HTML" 2>/dev/null | grep -qE "(script|text|ASCII)"; then
            echo "CHEAT: md2html is a script, not a compiled C binary"
            CHEAT_DETECTED=1
        fi
    fi
fi

if [ "$CHEAT_DETECTED" -eq 1 ]; then
    echo ""
    echo "Anti-cheat FAILED. Score = 0."
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    python3 -c "
import json
reward = {'composite_score': 0.0, 'error': 'cheat_detected'}
with open('$VERIFIER_DIR/reward.json', 'w') as f:
    json.dump(reward, f, indent=2)
print(json.dumps(reward, indent=2))
"
    exit 0
fi
echo "Anti-cheat passed."
echo ""

# ------------------------------------------------------------------
# Step 3: Correctness tests
# ------------------------------------------------------------------
correctness_total=0
correctness_passed=0
failed_cases=()
timing_start=$SECONDS

run_correctness_suite() {
    local cases_dir="$1"
    local suite_label="$2"

    if [ ! -d "$cases_dir" ]; then
        echo "WARNING: Cases directory not found: $cases_dir"
        return
    fi

    local suite_cases
    suite_cases=$(ls "$cases_dir"/test_*.json 2>/dev/null | wc -l)

    if [ "$suite_cases" -eq 0 ]; then
        echo "WARNING: No test cases found in $cases_dir"
        return
    fi

    echo "=== Running $suite_label correctness tests ($suite_cases cases) ==="
    echo ""

    local suite_pass=0
    local suite_fail=0

    for test_file in "$cases_dir"/test_*.json; do
        [ -f "$test_file" ] || continue

        test_name=$(basename "$test_file" .json)
        correctness_total=$((correctness_total + 1))

        # Extract markdown and expected html using python
        md_file=$(mktemp /tmp/md_XXXXXX.txt)
        expected_file=$(mktemp /tmp/expected_XXXXXX.txt)

        python3 -c "
import json, sys
with open('$test_file') as f:
    t = json.load(f)
with open('$md_file', 'w') as f:
    f.write(t['markdown'])
with open('$expected_file', 'w') as f:
    f.write(t['html'])
" 2>/dev/null

        # Run the agent's converter
        actual_file=$(mktemp /tmp/actual_XXXXXX.txt)
        if timeout 10 "$MD2HTML" < "$md_file" > "$actual_file" 2>/dev/null; then
            if diff -q "$actual_file" "$expected_file" >/dev/null 2>&1; then
                correctness_passed=$((correctness_passed + 1))
                suite_pass=$((suite_pass + 1))
            else
                suite_fail=$((suite_fail + 1))
                failed_cases+=("[$suite_label] $test_name")
            fi
        else
            suite_fail=$((suite_fail + 1))
            failed_cases+=("[$suite_label] $test_name (timeout/crash)")
        fi

        rm -f "$md_file" "$expected_file" "$actual_file"
    done

    echo "  $suite_label: $suite_pass passed, $suite_fail failed (of $((suite_pass + suite_fail)))"
    echo ""
}

run_correctness_suite "$VISIBLE_CASES_DIR" "visible"
run_correctness_suite "$HIDDEN_CASES_DIR" "hidden"

echo "Correctness subtotal: $correctness_passed / $correctness_total"
echo ""

# ------------------------------------------------------------------
# Step 4: Performance benchmarks
# ------------------------------------------------------------------
perf_total=0
perf_score_sum="0.0"

echo "=== Performance Benchmarks ==="
echo ""

if [ ! -x "$CMARK" ]; then
    echo "WARNING: cmark reference not found at $CMARK — skipping performance tests"
else
    for perf_file in "$PERF_DATA_DIR"/perf_*.md; do
        [ -f "$perf_file" ] || continue

        perf_name=$(basename "$perf_file" .md)
        perf_total=$((perf_total + 1))

        file_size=$(wc -c < "$perf_file")
        echo "  Benchmark: $perf_name ($(( file_size / 1024 )) KB)"

        # Time cmark (3 runs, take median)
        cmark_times=()
        for run in 1 2 3; do
            start_ns=$(date +%s%N 2>/dev/null || echo "0")
            "$CMARK" < "$perf_file" > /dev/null 2>&1
            end_ns=$(date +%s%N 2>/dev/null || echo "0")
            elapsed=$(python3 -c "print(f'{($end_ns - $start_ns) / 1e9:.6f}')")
            cmark_times+=("$elapsed")
        done
        cmark_median=$(python3 -c "
times = sorted([float(x) for x in '${cmark_times[0]},${cmark_times[1]},${cmark_times[2]}'.split(',')])
print(f'{times[1]:.6f}')
")

        # Time agent's md2html (3 runs, take median)
        agent_times=()
        agent_ok=1
        for run in 1 2 3; do
            start_ns=$(date +%s%N 2>/dev/null || echo "0")
            if timeout 60 "$MD2HTML" < "$perf_file" > /dev/null 2>&1; then
                end_ns=$(date +%s%N 2>/dev/null || echo "0")
                elapsed=$(python3 -c "print(f'{($end_ns - $start_ns) / 1e9:.6f}')")
                agent_times+=("$elapsed")
            else
                agent_ok=0
                break
            fi
        done

        if [ "$agent_ok" -eq 1 ] && [ "${#agent_times[@]}" -eq 3 ]; then
            agent_median=$(python3 -c "
times = sorted([float(x) for x in '${agent_times[0]},${agent_times[1]},${agent_times[2]}'.split(',')])
print(f'{times[1]:.6f}')
")
            # Score = min(1.0, (cmark_time * 5) / agent_time)
            test_score=$(python3 -c "
cmark_t = max(float($cmark_median), 0.0001)
agent_t = max(float($agent_median), 0.0001)
score = min(1.0, (cmark_t * 5.0) / agent_t)
print(f'{score:.4f}')
")
            perf_score_sum=$(python3 -c "print(round($perf_score_sum + $test_score, 4))")
            echo "    cmark: ${cmark_median}s, agent: ${agent_median}s, score: ${test_score}"
        else
            echo "    agent TIMEOUT/CRASH on $perf_name, score: 0.0"
        fi
    done
fi

echo ""

# ------------------------------------------------------------------
# Step 5: Composite score
# ------------------------------------------------------------------
TOTAL_TIME=$((SECONDS - timing_start))

echo "=========================================="
echo "  Verifier Results"
echo "=========================================="
echo "  Correctness: $correctness_passed / $correctness_total"
echo "  Perf benchmarks: $perf_total (score_sum=$perf_score_sum)"
echo "  Total time: ${TOTAL_TIME}s"
echo "=========================================="

python3 -c "
import json, sys

correctness_passed = $correctness_passed
correctness_total  = $correctness_total
perf_total         = $perf_total
perf_score_sum     = $perf_score_sum

W_CORRECT = 0.50
W_PERF    = 0.50

correctness_rate = correctness_passed / correctness_total if correctness_total > 0 else 0.0
perf_rate        = perf_score_sum / perf_total if perf_total > 0 else 0.0

# If a category has no tests, redistribute weight
active_weight = 0.0
if correctness_total > 0: active_weight += W_CORRECT
if perf_total > 0:        active_weight += W_PERF

if active_weight > 0:
    scale = 1.0 / active_weight
else:
    scale = 0.0

w_c = (W_CORRECT * scale) if correctness_total > 0 else 0.0
w_p = (W_PERF    * scale) if perf_total > 0         else 0.0

composite = w_c * correctness_rate + w_p * perf_rate
composite = round(composite, 4)

print()
print(f'  Correctness rate:  {correctness_rate:.4f}  (weight {w_c:.2f})')
print(f'  Performance rate:  {perf_rate:.4f}  (weight {w_p:.2f})')
print(f'  --')
print(f'  Composite score:   {composite:.4f}')
print()

with open('$VERIFIER_DIR/reward.txt', 'w') as f:
    f.write(str(composite))

reward = {
    'composite_score': composite,
    'correctness': {
        'passed': correctness_passed,
        'total': correctness_total,
        'rate': round(correctness_rate, 4),
        'weight': round(w_c, 4),
    },
    'performance': {
        'total': perf_total,
        'score_sum': round(perf_score_sum, 4),
        'rate': round(perf_rate, 4),
        'weight': round(w_p, 4),
    },
    'total_time_s': $TOTAL_TIME,
}
with open('$VERIFIER_DIR/reward.json', 'w') as f:
    json.dump(reward, f, indent=2)
print(json.dumps(reward, indent=2))
"

if [ ${#failed_cases[@]} -gt 0 ]; then
    echo ""
    echo "Failed/Error cases (first 50):"
    count=0
    for c in "${failed_cases[@]}"; do
        echo "  - $c"
        count=$((count + 1))
        if [ "$count" -ge 50 ]; then
            echo "  ... and $((${#failed_cases[@]} - 50)) more"
            break
        fi
    done
fi

echo ""
echo "End time: $(date)"
echo "========================================"
