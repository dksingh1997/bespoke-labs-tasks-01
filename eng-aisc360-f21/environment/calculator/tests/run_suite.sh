#!/bin/bash
#
# Run the AISC 360-22 F2.1 calculator test suite.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CASES_DIR="$SCRIPT_DIR/cases"
FORMATTER="$SCRIPT_DIR/../main.py"

if [ ! -f "$FORMATTER" ]; then
    echo "ERROR: Calculator not found at $FORMATTER"
    exit 1
fi

total=0
passed=0
failed=0
errors=0
failed_cases=()

start_time=$(python3 -c "import time; print(time.time())")

for case_dir in "$CASES_DIR"/case_*/; do
    case_name=$(basename "$case_dir")

    input_file="$case_dir/input.json"
    expected_file="$case_dir/expected.json"

    if [ ! -f "$input_file" ] || [ ! -f "$expected_file" ]; then
        echo "SKIP $case_name (missing files)"
        continue
    fi

    total=$((total + 1))
    output_file=$(mktemp /tmp/calc_output_XXXXXX.json)

    if timeout 30 python3 "$FORMATTER" "$input_file" "$output_file" 2>/dev/null; then
        # Compare with tolerance using Python
        match=$(python3 -c "
import json, sys
with open('$output_file') as f:
    actual = json.load(f)
with open('$expected_file') as f:
    expected = json.load(f)
tolerance = 0.01
all_match = True
for key in expected:
    if key not in actual:
        all_match = False
        break
    if isinstance(expected[key], (int, float)):
        if abs(actual[key] - expected[key]) / max(abs(expected[key]), 1e-10) > tolerance:
            all_match = False
            break
    elif actual[key] != expected[key]:
        all_match = False
        break
print('PASS' if all_match else 'FAIL')
")
        if [ "$match" = "PASS" ]; then
            echo "PASS $case_name"
            passed=$((passed + 1))
        else
            echo "FAIL $case_name (output mismatch)"
            failed=$((failed + 1))
            failed_cases+=("$case_name")
        fi
    else
        echo "ERROR $case_name (calculator crashed or timed out)"
        errors=$((errors + 1))
        failed_cases+=("$case_name")
    fi

    rm -f "$output_file"
done

end_time=$(python3 -c "import time; print(time.time())")
elapsed=$(python3 -c "print(f'{$end_time - $start_time:.3f}')")

echo ""
echo "=========================================="
echo "  Test Suite Results"
echo "=========================================="
echo "  Total:   $total"
echo "  Passed:  $passed"
echo "  Failed:  $failed"
echo "  Errors:  $errors"
echo "  Time:    ${elapsed}s"
echo "=========================================="

if [ ${#failed_cases[@]} -gt 0 ]; then
    echo ""
    echo "Failed/Error cases:"
    for c in "${failed_cases[@]}"; do
        echo "  - $c"
    done
fi

if [ "$passed" -eq "$total" ]; then
    echo ""
    echo "All tests passed!"
    exit 0
else
    exit 1
fi
