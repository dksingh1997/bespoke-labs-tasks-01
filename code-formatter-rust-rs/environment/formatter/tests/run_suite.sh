#!/bin/bash
#
# Run the Rust formatting test suite.
# Prints which tests pass/fail and total time.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CASES_DIR="$SCRIPT_DIR/cases"
FORMATTER_DIR="$SCRIPT_DIR/.."

if [ ! -f "$FORMATTER_DIR/Cargo.toml" ]; then
    echo "ERROR: Cargo.toml not found at $FORMATTER_DIR/Cargo.toml"
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

    input_file="$case_dir/input.rs"
    expected_file="$case_dir/expected_output.rs"

    if [ ! -f "$input_file" ] || [ ! -f "$expected_file" ]; then
        echo "SKIP $case_name (missing files)"
        continue
    fi

    total=$((total + 1))
    output_file=$(mktemp /tmp/formatter_output_XXXXXX.rs)

    if timeout 30 cargo run --manifest-path "$FORMATTER_DIR/Cargo.toml" -- "$input_file" "$output_file" 2>/dev/null; then
        if diff -q "$output_file" "$expected_file" >/dev/null 2>&1; then
            echo "PASS $case_name"
            passed=$((passed + 1))
        else
            echo "FAIL $case_name (output mismatch)"
            failed=$((failed + 1))
            failed_cases+=("$case_name")
        fi
    else
        echo "ERROR $case_name (formatter crashed or timed out)"
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
