#!/bin/bash
set -euo pipefail

VERIFIER_DIR="/logs/verifier"
mkdir -p "$VERIFIER_DIR"

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

echo "========================================"
echo "  Heap Allocator Verifier"
echo "========================================"
echo "Start time: $(date)"

cd /app/workspace

# Build
make clean 2>/dev/null || true
if ! make 2>&1; then
    echo "BUILD FAILED"
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    echo '{"score": 0.0, "error": "build_failed"}' > "$VERIFIER_DIR/reward.json"
    exit 0
fi

# Run test
./test_runner > /tmp/test_output.txt 2>&1 || true

# Check result
if grep -q "ALL TESTS PASSED" /tmp/test_output.txt; then
    SCORE=$(grep "ALL TESTS PASSED" /tmp/test_output.txt | grep -oP '\d+(?=/)' || echo "0")
    TOTAL=$(grep "ALL TESTS PASSED" /tmp/test_output.txt | grep -oP '(?<=/)\d+' || echo "1")
    python3 -c "print(f'{$SCORE/$TOTAL:.4f}')" > "$VERIFIER_DIR/reward.txt"
    python3 -c "import json; json.dump({'score': round($SCORE/$TOTAL, 4), 'passed': $SCORE, 'total': $TOTAL}, open('$VERIFIER_DIR/reward.json', 'w'))"
else
    echo "TEST FAILED"
    cat /tmp/test_output.txt | tail -30
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    echo '{"score": 0.0, "error": "tests_failed"}' > "$VERIFIER_DIR/reward.json"
fi
