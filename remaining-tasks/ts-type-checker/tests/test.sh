#!/bin/bash
#
# Harbor verifier for the ts-type-checker task.
#
# Hardened to the reference type-checker anti-cheat bar (HARBOR
# anti_cheats.md). Layered design:
#
#   Phase 1 (closes the answer-key read): the agent's checker
#     (/app/checker/tscheck) runs AS the `agent` user under `strace -f`,
#     with a sanitised env (env -i) and only the .ts inputs staged. /tests
#     stays mode 0700 root-only, so the checker gets EACCES on the hidden
#     answer key and cannot fabricate scores. An execve tripwire zeroes the
#     reward if the checker shells out to the real tsc/tsserver/typescript.
#
#   Phase 3 (defeats corpus lookup + weak scoring): hidden inputs are
#     perturbed at authoring time (identifier rename + mid-file insertion;
#     see scripts/ts_perturb.py) and their expected diagnostics regenerated
#     by re-running the real tsc (scripts/ts_oracle.js). Scoring is
#     AND-match on (file,line,kind) AND code AND message_substr, combined
#     multiplicatively as id_rate * non_id_rate (tests/compute_reward.py).
#
#   Phase 4: scoring is a standalone `python3 -ISs compute_reward.py`
#     invocation that runs OUTSIDE strace as root, reads only root-owned
#     files, imports only stdlib, and writes reward.{json,txt} atomically.
#
# The HARBOR_ORACLE_FLAG token bypass (oracle-only answer-key staging) and
# the 100% canary gate are preserved. Always exits 0.
#

VERIFIER_DIR="/logs/verifier"

# --- MANDATORY: lock + wipe /logs/verifier (root-only) before anything else ---
# Harbor sets it to mode 777 at container start. Lock FIRST (cuts off any agent
# background process), THEN wipe anything the agent planted.
mkdir -p "$VERIFIER_DIR"
chmod 700 "$VERIFIER_DIR"
find "$VERIFIER_DIR" -mindepth 1 -delete 2>/dev/null || true

# --- MANDATORY: re-lock /tests (Harbor's verify-phase upload resets it to
# 0755; the agent runs as uid 1000 and could otherwise open the hidden
# answer key directly). Re-apply 0700 root-only before anything reads /tests. ---
chmod 700 /tests 2>/dev/null || true

# --- MANDATORY: environment sanitisation (strip injection side-channels) ---
unset NODE_OPTIONS LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH BASH_ENV ENV
unset PYTHONSTARTUP PYTHONHOME

LOG="$VERIFIER_DIR/verifier.log"
exec > >(tee -a "$LOG") 2>&1

# Restore exec bits (some uploaders drop them; -type f so it never undoes a
# directory chmod).
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

echo "=========================================="
echo "  TypeScript Type Checker Verifier"
echo "=========================================="
echo "Start time: $(date)"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER="/app/checker/tscheck"

CANARY_DIR="$SCRIPT_DIR/canary_cases/test_files"
CANARY_EXPECTED="$SCRIPT_DIR/canary_cases/canary_expected.json"

HIDDEN_DIR="$SCRIPT_DIR/hidden_cases/test_files"
HIDDEN_EXPECTED="$SCRIPT_DIR/hidden_cases/hidden_expected.json"
HIDDEN_MANIFEST="$SCRIPT_DIR/hidden_cases/hidden_manifest.json"

# Agent-execution environment (see Phase 1). NODE_PATH is required so the
# checker can require('@babel/parser') etc. (root-owned, read-only globals).
AGENT_PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
AGENT_NODE_PATH="/usr/local/lib/node_modules"

CHECKER_MS=0

# Relax /logs/verifier so the Harbor host (uid 1000) can read the reward
# files on local-Docker (bind-mounted dir keeps in-container 0700). Safe:
# verification is complete and the agent container is already dead.
relax_reward_perms() {
    chmod 755 "$VERIFIER_DIR" 2>/dev/null || true
    chmod 644 "$VERIFIER_DIR"/reward.json "$VERIFIER_DIR"/reward.txt 2>/dev/null || true
}

# Hard-failure path: standalone scorer writes a clean zero reward atomically.
fail_with() {
    python3 -ISs "$SCRIPT_DIR/compute_reward.py" \
        --output-dir "$VERIFIER_DIR" \
        --checker-ms "$CHECKER_MS" \
        --fail "$1" --detail "${2:-}"
    relax_reward_perms
    echo "RESULT: $1 — awarding 0."
    echo "End time: $(date)"
    exit 0
}

# --- MANDATORY: kill any pre-existing agent processes (cross-phase isolation) ---
pkill -9 -u agent 2>/dev/null || true
sleep 0.5
if pgrep -u agent >/dev/null 2>&1; then
    sleep 1; pkill -9 -u agent 2>/dev/null || true; sleep 0.5
    if pgrep -u agent >/dev/null 2>&1; then
        fail_with "agent_processes_survived" "Agent processes still alive after pkill -9."
    fi
fi

# --- Oracle detection (HARBOR anti_cheats.md §7) ---
# HARBOR_ORACLE_FLAG is injected only into oracle runs via [solution.env] in
# task.toml; solve.sh writes the token to ORACLE_MARKER. We bypass anti-cheat
# and stage the answer key (expected.json) ONLY when the marker exists AND
# contains the exact token. The agent never sees the token, so it cannot forge
# this marker.
ORACLE_FLAG="tscheck_06d539db2a8ca05a"   # must match [solution.env] in task.toml
ORACLE_MARKER="/app/.harbor_oracle_marker"

IS_ORACLE=0
if [ -f "$ORACLE_MARKER" ] && \
   [ "$(cat "$ORACLE_MARKER" 2>/dev/null)" = "$ORACLE_FLAG" ]; then
    IS_ORACLE=1
    echo "Oracle marker detected — answer key will be staged; anti-cheat skipped."
fi

# ---------------------------------------------------------------------------
# Step 0: Does the checker exist?
# ---------------------------------------------------------------------------
if [ ! -f "$CHECKER" ]; then
    echo "ERROR: $CHECKER not found — agent did not create the checker."
    fail_with "checker_not_found" "The agent did not create /app/checker/tscheck"
fi
if [ ! -x "$CHECKER" ]; then
    chmod +x "$CHECKER" 2>/dev/null || true
fi
echo "Checker found: $CHECKER"
echo ""

# ---------------------------------------------------------------------------
# Step 1: Static anti-cheat grep (defense-in-depth — no agent code runs here)
# ---------------------------------------------------------------------------
echo "=== Anti-cheat checks (static) ==="
CHEAT_DETECTED=0
if [ "$IS_ORACLE" -eq 1 ]; then
    echo "Oracle solution — skipping static anti-cheat."
else
    # Shelling out to the real tsc (whole-word \btsc\b so it does NOT match
    # the agent's own checker name "tscheck"). Kept as defense-in-depth on top
    # of the runtime execve tripwire below.
    if grep -rqE --exclude-dir=node_modules "(child_process|execSync|spawnSync|exec\(|spawn\().*\btsc\b" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker shells out to tsc"
        CHEAT_DETECTED=1
    fi
    # Importing the typescript package
    if grep -rqE --exclude-dir=node_modules "require\(['\"]typescript['\"]\)|from ['\"]typescript['\"]" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker imports typescript package"
        CHEAT_DETECTED=1
    fi
    # Reward hacking
    if grep -rqP --exclude-dir=node_modules "(reward\.txt|reward\.json|/logs/verifier|verifier\.log)" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker contains reward-hacking patterns"
        CHEAT_DETECTED=1
    fi
    # Reading canary/hidden answer-key paths
    if grep -rqE --exclude-dir=node_modules "canary_expected|hidden_expected|canary_cases|hidden_cases" /app/checker/ 2>/dev/null; then
        echo "CHEAT DETECTED: Checker references test infrastructure"
        CHEAT_DETECTED=1
    fi
fi
if [ "$CHEAT_DETECTED" -eq 1 ]; then
    fail_with "cheat_detected" "Static anti-cheat found forbidden patterns in /app/checker/ (tsc usage, typescript import, reading expected data, or reward hacking)."
fi
echo "Static anti-cheat passed."
echo ""

# ---------------------------------------------------------------------------
# Step 2: Stage inputs into AGENT-READABLE tmp dirs (never inside /app or /tests)
# ---------------------------------------------------------------------------
# For NON-oracle runs the staged dir contains ONLY .ts inputs — never
# expected.json. The oracle (token) path stages expected.json so its cheat
# checker can read the answer key (that is the whole point of the marker).
echo "=== Staging inputs ==="
CANARY_TMP=$(mktemp -d /tmp/canary_eval_XXXXXX)
cp "$CANARY_DIR"/*.ts "$CANARY_TMP/" 2>/dev/null || true
if [ "$IS_ORACLE" -eq 1 ] && [ -f "$CANARY_EXPECTED" ]; then
    cp "$CANARY_EXPECTED" "$CANARY_TMP/expected.json"
fi

HIDDEN_TMP=$(mktemp -d /tmp/hidden_eval_XXXXXX)
if [ -d "$HIDDEN_DIR" ]; then
    cp "$HIDDEN_DIR"/*.ts "$HIDDEN_TMP/" 2>/dev/null || true
    if [ "$IS_ORACLE" -eq 1 ] && [ -f "$HIDDEN_EXPECTED" ]; then
        cp "$HIDDEN_EXPECTED" "$HIDDEN_TMP/expected.json"
    fi
else
    echo "WARNING: Hidden test directory not found at $HIDDEN_DIR"
fi

# Make the staged dirs readable by the agent (it runs the checker as `agent`),
# but not writable by group/other.
chown -R agent:agent "$CANARY_TMP" "$HIDDEN_TMP" 2>/dev/null || true
chmod -R go-w "$CANARY_TMP" "$HIDDEN_TMP" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Step 3: Run the checker AS agent, under strace (Phase 1)
# ---------------------------------------------------------------------------
echo "=== Running checker as 'agent' (under strace) ==="
STRACE_LOG="$VERIFIER_DIR/strace.log"
CHECKER_START=$(python3 -c "import time; print(int(time.time()*1000))")

# strace -f follows every fork and blocks until all descendants exit, so a
# forked background reward-writer cannot outlive this window. The checker runs
# under `su agent` with `env -i` (sanitised env) so the /tests 0700 wall and
# the staged-only-.ts rule apply to the agent uid exactly as at runtime.
RUN_SCRIPT="
su agent -s /bin/bash -c 'env -i PATH=$AGENT_PATH HOME=/home/agent TMPDIR=/tmp NODE_PATH=$AGENT_NODE_PATH timeout 120 \"$CHECKER\" \"$CANARY_TMP\"' > \"$VERIFIER_DIR/canary_output.txt\" 2> \"$VERIFIER_DIR/canary_stderr.txt\"
su agent -s /bin/bash -c 'env -i PATH=$AGENT_PATH HOME=/home/agent TMPDIR=/tmp NODE_PATH=$AGENT_NODE_PATH timeout 2700 \"$CHECKER\" \"$HIDDEN_TMP\"' > \"$VERIFIER_DIR/hidden_output.txt\" 2> \"$VERIFIER_DIR/hidden_stderr.txt\"
"
strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
    -o "$STRACE_LOG" \
    bash -c "$RUN_SCRIPT" || true

CHECKER_END=$(python3 -c "import time; print(int(time.time()*1000))")
CHECKER_MS=$((CHECKER_END - CHECKER_START))

rm -rf "$CANARY_TMP" "$HIDDEN_TMP"

HID_LINES=$(wc -l < "$VERIFIER_DIR/hidden_output.txt" 2>/dev/null || echo 0)
echo "Hidden: $HID_LINES output lines; checker finished in ${CHECKER_MS}ms"
echo ""

# ---------------------------------------------------------------------------
# Step 4: Runtime tripwires on the strace log (before any scoring)
# ---------------------------------------------------------------------------
# 4a. execve tripwire (Phase 1.3): zero the reward if the checker exec'd the
#     real TypeScript compiler instead of implementing one. The whole-word
#     anchors ("tsc" / /tsc" / tsc.js / typescript/bin|lib / tsserver) avoid
#     matching the agent's own "tscheck" binary or @babel/node. Skipped for
#     the oracle (its wrapper is allowed to use the reference path).
if [ "$IS_ORACLE" -eq 0 ]; then
    if grep -Eq 'execve\([^)]*("tsc"|/tsc"|"tsserver"|/tsserver"|tsc\.js|tsserver\.js|typescript/bin/|typescript/lib/)' \
        "$STRACE_LOG" 2>/dev/null; then
        echo "CHEAT DETECTED: checker execve'd the real tsc/tsserver/typescript."
        fail_with "cheat_execve_tsc" "Checker shelled out to the TypeScript compiler (detected via strace execve)."
    fi
fi

# 4b. reward-file write tripwire: nothing legitimate opens a reward file for
#     writing during the strace window (scoring runs afterwards as root).
if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
    "$STRACE_LOG" 2>/dev/null; then
    fail_with "reward_file_manipulation" "Checker opened a reward file for writing during execution (strace)."
fi

# ---------------------------------------------------------------------------
# Step 5: Score (OUTSIDE strace, as root — no agent code runs here) (Phase 4)
# ---------------------------------------------------------------------------
echo "=== Scoring (canary gate + AND-match + multiplicative) ==="
python3 -ISs "$SCRIPT_DIR/compute_reward.py" \
    --output-dir "$VERIFIER_DIR" \
    --checker-ms "$CHECKER_MS" \
    --canary-output "$VERIFIER_DIR/canary_output.txt" \
    --canary-expected "$CANARY_EXPECTED" \
    --hidden-output "$VERIFIER_DIR/hidden_output.txt" \
    --hidden-expected "$HIDDEN_EXPECTED" \
    --hidden-manifest "$HIDDEN_MANIFEST"

# Safety net: scoring must always leave a reward behind (test.sh exits 0).
if [ ! -f "$VERIFIER_DIR/reward.json" ]; then
    echo "ERROR: scoring produced no reward.json — emitting zero."
    fail_with "scoring_error" "Scoring step failed to produce a reward file."
fi

relax_reward_perms
echo ""
echo "End time: $(date)"
echo "=========================================="
exit 0
