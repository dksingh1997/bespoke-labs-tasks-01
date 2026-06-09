#!/bin/bash
#
# Harbor verifier for the ts-type-checker task.
#
# Scoring flow:
#   1. Anti-cheat checks
#   2. Run checker on canary tests (must pass 100% to qualify)
#   3. Run checker on hidden tests (this is the actual score)
#   Reward = hidden_passed / hidden_total  (only if canary gate passes)
#

set -euo pipefail

VERIFIER_DIR="/logs/verifier"
mkdir -p "$VERIFIER_DIR"
find "$VERIFIER_DIR" -mindepth 1 -delete 2>/dev/null || true

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

echo "=========================================="
echo "  TypeScript Type Checker Verifier"
echo "=========================================="
echo "Start time: $(date)"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER="/app/checker/tscheck"

CANARY_DIR="$SCRIPT_DIR/canary_cases/test_files"
export CANARY_EXPECTED="$SCRIPT_DIR/canary_cases/canary_expected.json"

HIDDEN_DIR="$SCRIPT_DIR/hidden_cases/test_files"
export HIDDEN_EXPECTED="$SCRIPT_DIR/hidden_cases/hidden_expected.json"
export HIDDEN_MANIFEST="$SCRIPT_DIR/hidden_cases/hidden_manifest.json"

# ---------------------------------------------------------------------------
# Step 0: Does the checker exist?
# ---------------------------------------------------------------------------
if [ ! -f "$CHECKER" ]; then
    echo "ERROR: $CHECKER not found — agent did not create the checker."
    python3 -c "
import json
json.dump({
    'score': 0.0,
    'reward': 0.0,
    'total_time_ms': 0,
    'subscores': [],
    'additional_data': {
        'error': 'checker_not_found',
        'error_detail': 'The agent did not create /app/checker/tscheck',
        'canary_gate': {'status': 'skipped'},
        'hidden_tests': {'passed': 0, 'total': 0},
        'category_summary': {},
    }
}, open('$VERIFIER_DIR/reward.json', 'w'), indent=2)
"
    echo "0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

if [ ! -x "$CHECKER" ]; then
    chmod +x "$CHECKER" 2>/dev/null || true
fi

echo "Checker found: $CHECKER"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Anti-cheat checks
# ---------------------------------------------------------------------------
echo "=== Anti-cheat checks ==="
CHEAT_DETECTED=0

if [ -f "/app/.oracle_solution" ]; then
    echo "Oracle solution detected — skipping anti-cheat."
else
    # 1a. Shelling out to tsc (exclude node_modules)
    if grep -rqE --exclude-dir=node_modules "(child_process|execSync|spawnSync|exec\(|spawn\().*tsc" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker shells out to tsc"
        CHEAT_DETECTED=1
    fi

    # 1b. Importing the typescript package (exclude node_modules)
    if grep -rqE --exclude-dir=node_modules "require\(['\"]typescript['\"]\)|from ['\"]typescript['\"]" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker imports typescript package"
        CHEAT_DETECTED=1
    fi

    # 1c. Reward hacking (exclude node_modules)
    if grep -rqP --exclude-dir=node_modules "(reward\.txt|reward\.json|/logs/verifier|verifier\.log)" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker contains reward-hacking patterns"
        CHEAT_DETECTED=1
    fi

    # 1d. Reading canary/hidden expected files (exclude node_modules)
    if grep -rqE --exclude-dir=node_modules "canary_expected|hidden_expected|canary_cases|hidden_cases" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker references test infrastructure"
        CHEAT_DETECTED=1
    fi

fi

if [ "$CHEAT_DETECTED" -eq 1 ]; then
    echo ""
    echo "RESULT: Cheating detected — awarding 0."
    python3 -c "
import json
json.dump({
    'score': 0.0,
    'reward': 0.0,
    'total_time_ms': 0,
    'subscores': [],
    'additional_data': {
        'error': 'cheat_detected',
        'error_detail': 'Anti-cheat checks found forbidden patterns in /app/checker/ (e.g. tsc usage, typescript import, reading expected data, or reward hacking)',
        'canary_gate': {'status': 'skipped'},
        'hidden_tests': {'passed': 0, 'total': 0},
        'category_summary': {},
    }
}, open('$VERIFIER_DIR/reward.json', 'w'), indent=2)
"
    echo "0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

echo ""
echo "Anti-cheat checks passed."
echo ""

# ---------------------------------------------------------------------------
# Step 2: Canary gate — must pass 100% to qualify for scoring
# ---------------------------------------------------------------------------
echo "=== Canary gate ==="

CANARY_TMP=$(mktemp -d /tmp/canary_eval_XXXXXX)
cp "$CANARY_DIR"/*.ts "$CANARY_TMP/" 2>/dev/null || true
if [ -f "/app/.oracle_solution" ] && [ -f "$CANARY_EXPECTED" ]; then
    cp "$CANARY_EXPECTED" "$CANARY_TMP/expected.json"
fi

timeout 120 "$CHECKER" "$CANARY_TMP" > "$VERIFIER_DIR/canary_output.txt" 2>"$VERIFIER_DIR/canary_stderr.txt" || true
rm -rf "$CANARY_TMP"

CANARY_STATUS=$(python3 << 'CANARY_PY'
import json, re, os, sys
from collections import defaultdict

VERIFIER_DIR = "/logs/verifier"
output_file = os.path.join(VERIFIER_DIR, "canary_output.txt")
expected_file = os.environ.get("CANARY_EXPECTED")

with open(expected_file) as f:
    expected = json.load(f)

re1 = re.compile(r"^(.+?\.ts)\((\d+),\d+\):\s*error")
re2 = re.compile(r"^(.+?\.ts):(\d+):\d+\s*-?\s*error")

actual = defaultdict(set)
with open(output_file, errors="replace") as f:
    for line in f:
        s = line.strip()
        m = re1.match(s) or re2.match(s)
        if m:
            actual[m.group(1)].add(int(m.group(2)))

passed = 0
total = len(expected)
canary_results = []

for name, errs in sorted(expected.items()):
    fname = name + ".ts"
    exp_lines = set(e["line"] for e in errs)
    act_lines = actual.get(fname, set())
    ok = act_lines == exp_lines
    if ok:
        passed += 1
        canary_results.append({"test": fname, "passed": True})
    else:
        fp = sorted(act_lines - exp_lines)
        fn = sorted(exp_lines - act_lines)
        canary_results.append({
            "test": fname, "passed": False,
            "expected_error_lines": sorted(exp_lines),
            "actual_error_lines": sorted(act_lines),
            "false_positives": fp, "false_negatives": fn,
        })
        print(f"  {fname}: expected={sorted(exp_lines)} got={sorted(act_lines)} fp={fp} fn={fn}")

print(f"Canary: {passed}/{total}")

if passed == total:
    print("CANARY GATE: PASSED")
else:
    print("CANARY GATE: FAILED")
    json.dump({
        "score": 0.0,
        "reward": 0.0,
        "total_time_ms": 0,
        "subscores": [],
        "additional_data": {
            "error": "canary_gate_failed",
            "error_detail": f"Canary gate requires 100% pass rate. Got {passed}/{total}.",
            "canary_gate": {
                "status": "failed",
                "passed": passed,
                "total": total,
                "results": canary_results,
            },
            "hidden_tests": {"passed": 0, "total": 0},
            "category_summary": {},
        },
    }, open(os.path.join(VERIFIER_DIR, "reward.json"), "w"), indent=2)
    with open(os.path.join(VERIFIER_DIR, "reward.txt"), "w") as f:
        f.write("0")

# Write canary detail for later use
json.dump({"passed": passed, "total": total, "results": canary_results},
          open(os.path.join(VERIFIER_DIR, "canary_detail.json"), "w"), indent=2)
CANARY_PY
)

echo "$CANARY_STATUS"

if echo "$CANARY_STATUS" | grep -q "CANARY GATE: FAILED"; then
    echo ""
    echo "RESULT: Canary gate failed — awarding 0."
    exit 0
fi

echo ""

# ---------------------------------------------------------------------------
# Step 3: Run checker on hidden tests (this determines the actual score)
# ---------------------------------------------------------------------------
echo "=== Running checker on hidden tests ==="

CHECKER_START=$(python3 -c "import time; print(int(time.time()*1000))")

HIDDEN_TMP=$(mktemp -d /tmp/hidden_eval_XXXXXX)
if [ -d "$HIDDEN_DIR" ]; then
    cp "$HIDDEN_DIR"/*.ts "$HIDDEN_TMP/" 2>/dev/null || true
    if [ -f "/app/.oracle_solution" ] && [ -f "$HIDDEN_EXPECTED" ]; then
        cp "$HIDDEN_EXPECTED" "$HIDDEN_TMP/expected.json"
    fi
    timeout 2700 "$CHECKER" "$HIDDEN_TMP" > "$VERIFIER_DIR/hidden_output.txt" 2>"$VERIFIER_DIR/hidden_stderr.txt" || true
    HID_LINES=$(wc -l < "$VERIFIER_DIR/hidden_output.txt")
    echo "Hidden: $HID_LINES output lines"
else
    echo "WARNING: Hidden test directory not found at $HIDDEN_DIR"
    touch "$VERIFIER_DIR/hidden_output.txt"
fi
rm -rf "$HIDDEN_TMP"

CHECKER_END=$(python3 -c "import time; print(int(time.time()*1000))")
CHECKER_MS=$((CHECKER_END - CHECKER_START))
echo "Checker finished in ${CHECKER_MS}ms"
echo ""

# ---------------------------------------------------------------------------
# Step 4: Score hidden tests only
# ---------------------------------------------------------------------------
echo "=== Scoring (hidden tests only) ==="

export CHECKER_MS="$CHECKER_MS"

python3 << 'PYTHON'
import json
import os
import re
from collections import Counter, defaultdict

VERIFIER_DIR = "/logs/verifier"

re1 = re.compile(r"^(.+?\.ts)\((\d+),\d+\):\s*error")
re2 = re.compile(r"^(.+?\.ts):(\d+):\d+\s*-?\s*error")


def parse_checker_output(output_file):
    errors = defaultdict(set)
    with open(output_file, "r", errors="replace") as f:
        for line in f:
            s = line.strip()
            if not s:
                continue
            m = re1.match(s) or re2.match(s)
            if m:
                errors[m.group(1)].add(int(m.group(2)))
    return errors


hidden_expected_path = os.environ.get("HIDDEN_EXPECTED", "")
hidden_manifest_path = os.environ.get("HIDDEN_MANIFEST", "")
checker_ms = int(os.environ.get("CHECKER_MS", "0"))

canary_detail = {}
canary_path = os.path.join(VERIFIER_DIR, "canary_detail.json")
if os.path.exists(canary_path):
    with open(canary_path) as f:
        canary_detail = json.load(f)

if not os.path.exists(hidden_manifest_path):
    print("Hidden manifest not found — scoring 0")
    score = 0.0
    hid_pass, hid_total = 0, 0
    subscores = []
    category_summary = {}
else:
    with open(hidden_expected_path) as f:
        expected = json.load(f)
    with open(hidden_manifest_path) as f:
        manifest = json.load(f)

    actual = parse_checker_output(os.path.join(VERIFIER_DIR, "hidden_output.txt"))

    hid_pass = 0
    hid_total = len(manifest)
    subscores = []
    cat_pass = Counter()
    cat_total = Counter()

    for test in manifest:
        name = test["name"]
        fname = test["file"]
        cat = test.get("category", "unknown")
        expected_lines = set(e["line"] for e in expected.get(name, []))
        actual_lines = actual.get(fname, set())

        cat_total[cat] += 1

        if actual_lines == expected_lines:
            hid_pass += 1
            cat_pass[cat] += 1
            subscores.append({
                "subtask": f"{cat}/{name}",
                "score": 1,
            })
        else:
            fp = sorted(actual_lines - expected_lines)
            fn = sorted(expected_lines - actual_lines)
            reason_parts = []
            if fp:
                reason_parts.append(f"false_positives_on_lines={fp[:5]}")
            if fn:
                reason_parts.append(f"missed_error_lines={fn[:5]}")
            subscores.append({
                "subtask": f"{cat}/{name}",
                "score": 0,
                "reason": "; ".join(reason_parts) if reason_parts else "wrong_error_lines",
            })

    score = round(hid_pass / hid_total, 6) if hid_total > 0 else 0.0

    print(f"Hidden: {hid_pass}/{hid_total} ({hid_pass/hid_total:.2%})")
    print(f"Score: {score}")
    print("")
    print("By category:")

    category_summary = {}
    for cat in sorted(cat_total.keys()):
        p = cat_pass[cat]
        t = cat_total[cat]
        r = round(p / t, 4) if t > 0 else 0.0
        category_summary[cat] = {
            "passed": p,
            "total": t,
            "pass_rate": r,
        }
        print(f"  {cat}: {p}/{t} ({r:.2%})")

reward = {
    "score": score,
    "reward": score,
    "subscores": subscores,
    "additional_data": {
        "total_time_ms": checker_ms,
        "checker_time_ms": checker_ms,
        "canary_gate": {
            "status": "passed",
            "passed": canary_detail.get("passed", 0),
            "total": canary_detail.get("total", 0),
            "results": canary_detail.get("results", []),
        },
        "hidden_tests": {
            "passed": hid_pass,
            "total": hid_total,
        },
        "category_summary": category_summary,
    },
}

with open(os.path.join(VERIFIER_DIR, "reward.json"), "w") as f:
    json.dump(reward, f, indent=2)

with open(os.path.join(VERIFIER_DIR, "reward.txt"), "w") as f:
    f.write(str(score))

summary = {k: v for k, v in reward.items() if k != "subscores"}
summary["subscores_count"] = len(subscores)
print(f"\n{json.dumps(summary, indent=2)}")
PYTHON

echo ""
echo "End time: $(date)"
echo "=========================================="
