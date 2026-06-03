#!/bin/bash
#
# Harbor verifier for the AISC 360-22 F2.1 calculator task.
#

set -euo pipefail

VERIFIER_DIR="/logs/verifier"
mkdir -p "$VERIFIER_DIR"

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

echo "========================================"
echo "  AISC 360-22 F2.1 Calculator Verifier"
echo "========================================"
echo "Start time: $(date)"
echo ""

ORIGINAL_CASES_DIR="/app/calculator/tests/cases"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HIDDEN_CASES_DIR="$SCRIPT_DIR/hidden_cases"
FORMATTER="/app/calculator/main.py"

if [ ! -f "$FORMATTER" ]; then
    echo "ERROR: Calculator not found at $FORMATTER"
    echo '{"pass_rate": 0.0, "passed": 0, "total": 0, "error": "calculator_not_found"}' > "$VERIFIER_DIR/reward.json"
    echo "0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

total=0
passed=0
failed=0
errors=0
failed_cases=()
timing_total=0

compare_json() {
    local actual="$1"
    local expected="$2"
    python3 -c "
import json
with open('$actual') as f: a = json.load(f)
with open('$expected') as f: e = json.load(f)
tol = 0.01
ok = True
for key in e:
    if key not in a:
        ok = False; break
    if isinstance(e[key], (int, float)):
        if abs(a[key] - e[key]) / max(abs(e[key]), 1e-10) > tol:
            ok = False; break
    elif a[key] != e[key]:
        ok = False; break
print('PASS' if ok else 'FAIL')
"
}

run_test_suite() {
    local cases_dir="$1"
    local suite_label="$2"

    if [ ! -d "$cases_dir" ]; then
        echo "WARNING: Cases directory not found: $cases_dir"
        return
    fi

    local suite_cases=0
    for case_dir in "$cases_dir"/case_*/; do
        [ -d "$case_dir" ] || continue
        suite_cases=$((suite_cases + 1))
    done

    if [ "$suite_cases" -eq 0 ]; then
        echo "WARNING: No test cases found in $cases_dir"
        return
    fi

    echo "=== Running $suite_label ($suite_cases cases) ==="
    echo ""

    for case_dir in "$cases_dir"/case_*/; do
        [ -d "$case_dir" ] || continue

        case_name=$(basename "$case_dir")
        input_file="$case_dir/input.json"
        expected_file="$case_dir/expected.json"

        if [ ! -f "$input_file" ] || [ ! -f "$expected_file" ]; then
            echo "SKIP [$suite_label] $case_name (missing files)"
            continue
        fi

        total=$((total + 1))
        output_file=$(mktemp /tmp/calc_output_XXXXXX.json)

        start_ms=$(python3 -c "import time; print(int(time.time()*1000))")

        if timeout 30 python3 "$FORMATTER" "$input_file" "$output_file" 2>/dev/null; then
            end_ms=$(python3 -c "import time; print(int(time.time()*1000))")
            elapsed_ms=$((end_ms - start_ms))
            timing_total=$((timing_total + elapsed_ms))

            match=$(compare_json "$output_file" "$expected_file")
            if [ "$match" = "PASS" ]; then
                echo "PASS [$suite_label] $case_name (${elapsed_ms}ms)"
                passed=$((passed + 1))
            else
                echo "FAIL [$suite_label] $case_name (output mismatch, ${elapsed_ms}ms)"
                failed=$((failed + 1))
                failed_cases+=("[$suite_label] $case_name")
            fi
        else
            end_ms=$(python3 -c "import time; print(int(time.time()*1000))")
            elapsed_ms=$((end_ms - start_ms))
            timing_total=$((timing_total + elapsed_ms))
            echo "ERROR [$suite_label] $case_name (crashed/timed out, ${elapsed_ms}ms)"
            errors=$((errors + 1))
            failed_cases+=("[$suite_label] $case_name")
        fi

        rm -f "$output_file"
    done

    echo ""
}

run_test_suite "$ORIGINAL_CASES_DIR" "original"
run_test_suite "$HIDDEN_CASES_DIR" "hidden"

echo ""
echo "=========================================="
echo "  Verifier Results"
echo "=========================================="
echo "  Total:       $total"
echo "  Passed:      $passed"
echo "  Failed:      $failed"
echo "  Errors:      $errors"
echo "  Total time:  ${timing_total}ms"
echo "=========================================="

if [ "$total" -gt 0 ]; then
    pass_rate=$(python3 -c "print(round($passed / $total, 4))")
else
    pass_rate="0.0"
fi

echo ""
echo "Pass rate: $pass_rate ($passed/$total)"

if [ ${#failed_cases[@]} -gt 0 ]; then
    echo ""
    echo "Failed/Error cases:"
    for c in "${failed_cases[@]}"; do
        echo "  - $c"
    done
fi

echo "$pass_rate" > "$VERIFIER_DIR/reward.txt"

python3 -c "
import json
reward = {
    'pass_rate': $pass_rate,
    'passed': $passed,
    'total': $total,
    'failed': $failed,
    'errors': $errors,
    'total_time_ms': $timing_total,
}
with open('$VERIFIER_DIR/reward.json', 'w') as f:
    json.dump(reward, f, indent=2)
print(json.dumps(reward, indent=2))
"

echo ""
echo "End time: $(date)"
echo "========================================"
