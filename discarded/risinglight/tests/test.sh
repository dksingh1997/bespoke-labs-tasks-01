#!/bin/bash

mkdir -p /logs/verifier

# ── 1. Restore pristine test data (undo any agent tampering with .slt files) ──
echo "=== Restoring pristine test files ==="
cp -f /tests/sql/*.slt /app/tests/sql/

cd /app

# ── 2. Build and run SQL logic tests ──
echo "=== Building and running SQL logic tests ==="
test_output=$(cargo test --test sqllogictest 2>&1)
echo "$test_output" | tee /logs/verifier/test_output.txt

# ── 3. Parse test results ──
# libtest-mimic outputs: "test result: ok. X passed; Y failed; ..."
# or: "test result: FAILED. X passed; Y failed; ..."
result_line=$(echo "$test_output" | grep "test result:")

if [ -z "$result_line" ]; then
    echo "No test results found (build may have failed)"
    passed=0
    failed=0
    total=0
    echo "0.0" > /logs/verifier/reward.txt
else
    passed=$(echo "$result_line" | grep -oP '(\d+) passed' | grep -oP '\d+')
    failed=$(echo "$result_line" | grep -oP '(\d+) failed' | grep -oP '\d+')

    [ -z "$passed" ] && passed=0
    [ -z "$failed" ] && failed=0

    total=$((passed + failed))

    if [ "$total" -eq 0 ]; then
        echo "0.0" > /logs/verifier/reward.txt
    else
        python3 -c "print(round($passed / $total, 4))" > /logs/verifier/reward.txt
    fi
fi

reward=$(cat /logs/verifier/reward.txt)
echo "{\"passed\": $passed, \"failed\": $failed, \"total\": $total, \"reward\": $reward}" > /logs/verifier/reward.json

echo ""
echo "=== Test Summary ==="
echo "Passed: $passed / $total"
echo "=== Reward ==="
cat /logs/verifier/reward.txt
