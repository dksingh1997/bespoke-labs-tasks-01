#!/bin/bash
#
# Harbor verifier for the binary-protocol-re task.
#
# Runs the agent's decoder on the capture file, compares each decoded message
# against expected output, and reports score = correct / 100.
#

set -euo pipefail

VERIFIER_DIR="/logs/verifier"
mkdir -p "$VERIFIER_DIR"

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

echo "========================================"
echo "  MeshLink Protocol Decoder Verifier"
echo "========================================"
echo "Start time: $(date)"
echo ""

DECODER="/app/workspace/decoder"
CAPTURE="/app/workspace/capture.bin"
EXPECTED="/tests/expected_output.jsonl"
AGENT_OUT="/tmp/agent_output.jsonl"

# Check decoder exists
if [ ! -f "$DECODER" ]; then
    echo "ERROR: $DECODER not found — agent did not create the decoder."
    echo "0.0" > "$VERIFIER_DIR/reward.txt"
    echo '{"score": 0.0, "correct": 0, "total": 100, "error": "decoder_not_found"}' \
        > "$VERIFIER_DIR/reward.json"
    exit 0
fi

# Check decoder is executable
if [ ! -x "$DECODER" ]; then
    chmod +x "$DECODER" 2>/dev/null || true
fi

# Run decoder with timeout
echo "Running decoder..."
timeout 120 "$DECODER" "$CAPTURE" > "$AGENT_OUT" 2>/tmp/decoder_stderr.txt || true

if [ -f /tmp/decoder_stderr.txt ] && [ -s /tmp/decoder_stderr.txt ]; then
    echo "Decoder stderr:"
    head -20 /tmp/decoder_stderr.txt
    echo ""
fi

AGENT_LINES=$(wc -l < "$AGENT_OUT" 2>/dev/null || echo "0")
echo "Decoder produced $AGENT_LINES output lines."
echo ""

# Compare outputs
python3 - "$EXPECTED" "$AGENT_OUT" << 'PYEOF'
import json
import sys

expected_path = sys.argv[1]
actual_path = sys.argv[2]

with open(expected_path) as f:
    expected_lines = f.read().strip().split('\n')

try:
    with open(actual_path) as f:
        content = f.read().strip()
        actual_lines = content.split('\n') if content else []
except Exception:
    actual_lines = []

total = len(expected_lines)
correct = 0
details = []

def deep_equal(a, b):
    """Order-independent comparison for dicts, order-dependent for lists."""
    if type(a) != type(b):
        return False
    if isinstance(a, dict):
        if set(a.keys()) != set(b.keys()):
            return False
        return all(deep_equal(a[k], b[k]) for k in a)
    if isinstance(a, list):
        if len(a) != len(b):
            return False
        return all(deep_equal(x, y) for x, y in zip(a, b))
    return a == b

for i in range(total):
    if i < len(actual_lines):
        try:
            exp = json.loads(expected_lines[i])
            act = json.loads(actual_lines[i])
            if deep_equal(exp, act):
                correct += 1
                details.append({"index": i, "status": "correct"})
            else:
                details.append({"index": i, "status": "wrong",
                                "expected_type": exp.get("type", "?"),
                                "actual_type": act.get("type", "?")})
        except json.JSONDecodeError as e:
            details.append({"index": i, "status": "parse_error", "error": str(e)})
    else:
        details.append({"index": i, "status": "missing"})

score = correct / total if total > 0 else 0.0

print(f"Score: {correct}/{total} = {score:.4f}")
print()

wrong = [d for d in details if d["status"] != "correct"]
if wrong:
    print(f"Incorrect/missing messages ({len(wrong)}):")
    for d in wrong[:20]:
        print(f"  Message {d['index']}: {d['status']}", end="")
        if 'expected_type' in d:
            print(f" (expected={d['expected_type']}, got={d['actual_type']})", end="")
        print()
    if len(wrong) > 20:
        print(f"  ... and {len(wrong) - 20} more")

with open("/logs/verifier/reward.txt", "w") as f:
    f.write(f"{score:.4f}\n")

result = {"score": round(score, 4), "correct": correct, "total": total}
with open("/logs/verifier/reward.json", "w") as f:
    json.dump(result, f)

print(f"\nFinal score written: {score:.4f}")
PYEOF
