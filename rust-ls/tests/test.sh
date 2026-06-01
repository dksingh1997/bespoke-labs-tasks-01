#!/bin/bash
set -euo pipefail

VERIFIER_DIR="/logs/verifier"
mkdir -p "$VERIFIER_DIR"
WORK_DIR=$(mktemp -d)
trap "rm -rf $WORK_DIR" EXIT

exec > >(tee -a "$VERIFIER_DIR/verifier.log") 2>&1

RLS="/app/workspace/rls"
FIXTURES="/app/fixtures"

# ---------------------------------------------------------------------------
# Decrypt the oracle binary (key is only in this file, not in the image)
# ---------------------------------------------------------------------------

DECRYPT_KEY="r5tL5_v3r1f1er_k3y_8f2a"
ORACLE="$WORK_DIR/oracle_ls"
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in /app/.test_data/oracle.enc \
    -pass pass:$DECRYPT_KEY \
    -out "$ORACLE"
chmod +x "$ORACLE"

# ---------------------------------------------------------------------------
# Sanity checks
# ---------------------------------------------------------------------------

if [ ! -f "$RLS" ]; then
    if [ -f /app/workspace/Cargo.toml ]; then
        echo "No binary at $RLS, attempting cargo build first..."
        cd /app/workspace
        cargo build --release 2>&1 || true
        for bin in target/release/*; do
            if [ -f "$bin" ] && [ -x "$bin" ] && file "$bin" | grep -q "ELF"; then
                cp "$bin" "$RLS"
                echo "Copied $bin -> $RLS"
                break
            fi
        done
        cd /app
    fi
fi

if [ ! -f "$RLS" ]; then
    echo "No binary found at $RLS"
    echo "0" > "$VERIFIER_DIR/reward.txt"
    exit 0
fi

chmod +x "$RLS" 2>/dev/null || true

echo "Binary: $RLS"
echo ""

# ---------------------------------------------------------------------------
# Anti-cheat checks
# ---------------------------------------------------------------------------

echo "Running anti-cheat checks..."
CHEAT=0

if [ -f "/app/workspace/.oracle_solution" ]; then
    echo "Oracle solution detected — skipping anti-cheat."
else
    if grep -rq "/oracle/" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: References to oracle path"
        CHEAT=1
    fi

    if grep -rq "\.test_data" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: References to encrypted test data"
        CHEAT=1
    fi

    if grep -rq "oracle\.enc" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: References to encrypted oracle"
        CHEAT=1
    fi

    if grep -rq "r5tL5_v3r1f1er" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Decryption key found in workspace"
        CHEAT=1
    fi

    if grep -rqP "(reward\.txt|reward\.json|/logs/verifier)" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Reward hacking patterns"
        CHEAT=1
    fi

    if [ -f /app/workspace/Cargo.toml ]; then
        if grep -qi "uutils\|coreutils" /app/workspace/Cargo.toml 2>/dev/null; then
            echo "CHEAT DETECTED: Banned crate (uutils/coreutils)"
            CHEAT=1
        fi
    fi

    if grep -rq "ls_backup" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Using backup ls binary"
        CHEAT=1
    fi

    if grep -rqP "/usr/bin/(dir|vdir)\b" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Using dir/vdir coreutils variant"
        CHEAT=1
    fi

    # Check if the submitted binary is just a copy of the system ls
    if [ -x "$ORACLE" ] && [ -x "$RLS" ]; then
        ORACLE_HASH=$(sha256sum "$ORACLE" | cut -d' ' -f1)
        RLS_HASH=$(sha256sum "$RLS" | cut -d' ' -f1)
        if [ "$ORACLE_HASH" = "$RLS_HASH" ]; then
            echo "CHEAT DETECTED: Binary is identical to oracle ls"
            CHEAT=1
        fi
    fi
fi

if [ "$CHEAT" -eq 1 ]; then
    echo "0" > "$VERIFIER_DIR/reward.txt"
    python3 -c "
import json
result = {
    'score': 0,
    'subscores': [],
    'additional_data': {
        'tests_passed': 0,
        'tests_total': 0,
        'pass_rate': 0,
        'cheating_penalty_multiplier': 0.0,
        'cheating_reasons': ['anti-cheat check failed — see verifier.log for details'],
    },
}
json.dump(result, open('$VERIFIER_DIR/reward.json', 'w'), indent=2)
"
    exit 0
fi

echo "Anti-cheat: PASSED"
echo ""

# ---------------------------------------------------------------------------
# Standard test environment
# ---------------------------------------------------------------------------

export LC_ALL=C
export TZ=UTC
export COLUMNS=80
export TERM=xterm-256color

# ---------------------------------------------------------------------------
# Tier weights
# ---------------------------------------------------------------------------

declare -A WEIGHTS
WEIGHTS[tier1_basic]=0.03
WEIGHTS[tier2_long_format]=0.12
WEIGHTS[tier3_sorting]=0.10
WEIGHTS[tier4_formatting]=0.00
WEIGHTS[tier5_symlinks_recursion]=0.20
WEIGHTS[tier6_quoting_escaping]=0.22
WEIGHTS[tier7_time_size]=0.15
WEIGHTS[tier8_color_advanced]=0.15
WEIGHTS[tier9_performance]=0.03

TOTAL_SCORE=0
TOTAL_PASS=0
TOTAL_TESTS=0
SUBSCORES_JSON="$WORK_DIR/subscores.json"
echo "[]" > "$SUBSCORES_JSON"

# ---------------------------------------------------------------------------
# Python helper: run a binary on a test case and produce normalized output
# ---------------------------------------------------------------------------

cat > "$WORK_DIR/run_test.py" << 'PYEOF'
#!/usr/bin/env python3
import json
import os
import subprocess
import sys

binary = sys.argv[1]
test_file = sys.argv[2]
fixtures_dir = sys.argv[3]
out_file = sys.argv[4]

with open(test_file) as f:
    tc = json.load(f)

fixture = tc["fixture"]
flags = tc.get("flags", [])
timeout = tc.get("timeout", 10)
env_extra = tc.get("env_extra", {})
args = tc.get("args")

fixture_path = os.path.join(fixtures_dir, fixture)

if args:
    full_args = [os.path.join(fixture_path, a) for a in args]
else:
    full_args = [fixture_path]

cmd = [binary] + flags + full_args

env = dict(os.environ)
env.update(env_extra)

try:
    result = subprocess.run(
        cmd,
        capture_output=True,
        env=env,
        timeout=timeout,
    )
    stdout = result.stdout.decode("utf-8", errors="replace")
except subprocess.TimeoutExpired:
    stdout = ""
except Exception:
    stdout = ""

lines = stdout.split("\n")
cleaned = [l.rstrip() for l in lines]
while cleaned and cleaned[-1] == "":
    cleaned.pop()
out = "\n".join(cleaned) + "\n" if cleaned else ""

with open(out_file, "w") as f:
    f.write(out)
PYEOF

# ---------------------------------------------------------------------------
# Run tests tier by tier — compare agent vs oracle at runtime
# ---------------------------------------------------------------------------

for tier_dir in /app/tests/tier*; do
    tier=$(basename "$tier_dir")
    weight=${WEIGHTS[$tier]:-0}

    echo ""
    echo "=== $tier (weight: $weight) ==="

    pass=0
    total=0

    for test_file in "$tier_dir"/*.json; do
        [ -f "$test_file" ] || continue

        test_name=$(python3 -c "import json; print(json.load(open('$test_file'))['name'])")

        total=$((total + 1))
        oracle_file="$WORK_DIR/${test_name}.oracle"
        actual_file="$WORK_DIR/${test_name}.actual"

        python3 "$WORK_DIR/run_test.py" "$ORACLE" "$test_file" "$FIXTURES" "$oracle_file"
        python3 "$WORK_DIR/run_test.py" "$RLS" "$test_file" "$FIXTURES" "$actual_file"

        if diff -q "$actual_file" "$oracle_file" > /dev/null 2>&1; then
            pass=$((pass + 1))
            python3 -c "
import json
s = json.load(open('$SUBSCORES_JSON'))
s.append({'subtask': '$tier/$test_name', 'score': 1})
json.dump(s, open('$SUBSCORES_JSON', 'w'))
"
        else
            if [ ! -s "$actual_file" ]; then
                echo "  FAIL $test_name (timeout/crash)"
            else
                echo "  FAIL $test_name (mismatch)"
            fi
            diff_file="$VERIFIER_DIR/${test_name}.diff"
            diff -u "$oracle_file" "$actual_file" > "$diff_file" 2>/dev/null || true
            cp "$actual_file" "$VERIFIER_DIR/${test_name}.actual" 2>/dev/null || true
            cp "$oracle_file" "$VERIFIER_DIR/${test_name}.oracle" 2>/dev/null || true
            python3 -c "
import json
s = json.load(open('$SUBSCORES_JSON'))
s.append({'subtask': '$tier/$test_name', 'score': 0})
json.dump(s, open('$SUBSCORES_JSON', 'w'))
"
        fi

    done

    if [ "$total" -gt 0 ]; then
        rate=$(echo "scale=6; $pass / $total" | bc)
        weighted=$(echo "scale=6; $rate * $weight" | bc)
    else
        rate=0
        weighted=0
    fi

    echo "  $tier: $pass/$total (rate=$rate, weighted=$weighted)"
    TOTAL_SCORE=$(echo "scale=6; $TOTAL_SCORE + $weighted" | bc)
    TOTAL_PASS=$((TOTAL_PASS + pass))
    TOTAL_TESTS=$((TOTAL_TESTS + total))
done

echo ""
echo "Total tests passed: $TOTAL_PASS/$TOTAL_TESTS"
echo "FINAL SCORE: $TOTAL_SCORE"

echo "$TOTAL_SCORE" > "$VERIFIER_DIR/reward.txt"

python3 -c "
import json
score = float('$TOTAL_SCORE')
total_pass = int('$TOTAL_PASS')
total_tests = int('$TOTAL_TESTS')
subscores = json.load(open('$SUBSCORES_JSON'))
result = {
    'score': score,
    'subscores': subscores,
    'additional_data': {
        'tests_passed': total_pass,
        'tests_total': total_tests,
        'pass_rate': total_pass / total_tests if total_tests > 0 else 0,
        'cheating_penalty_multiplier': 1.0,
        'cheating_reasons': [],
    },
}
with open('$VERIFIER_DIR/reward.json', 'w') as f:
    json.dump(result, f, indent=2)
" 2>/dev/null || true
