#!/bin/bash
# Verifier entry point for rust-ls — hardened run-as-agent + env -i isolation.
#
# Threat that this rewrite closes: the previous verifier built the crate
# (build.rs) and ran the agent binary $RLS AS ROOT, and it exported $ORACLE
# (decrypted GNU ls), $FIXTURES and $TESTS_DEFS_DIR into the environment. A
# root-running rls could therefore `exec($ORACLE)` (byte-identical output) or
# read the root-only test definitions / fixtures straight out of those env
# vars. Now:
#
#   * build.rs (`cargo build --release`) AND the agent binary run AS the
#     non-root `agent` user, under `strace -f`, with `env -i` so NONE of the
#     verifier's variables ($ORACLE/$FIXTURES/$TESTS_DEFS_DIR/...) are
#     inherited. The per-case fixture path is passed only as an argv.
#   * The trusted oracle ls is run root-side, OUTSIDE strace, to produce the
#     expected output; the decrypt + diff + scoring also stay root-side.
#   * A strace tripwire zeroes the reward if the agent binary execve's
#     ls/dir/vdir or the decrypted oracle, or writes the reward files.
#
# KEPT from the previous design: build-from-source enforcement (oracle token
# exempt), the oracle decrypt + ELF-validation guard, the HARBOR_ORACLE_FLAG
# marker, and the static workspace anti-cheat greps.
#
# No `set -euo pipefail` (an early abort could leave a planted reward in place).
# Always exits 0 — the outcome is encoded in /logs/verifier/reward.{json,txt}.

VERIFIER_DIR="/logs/verifier"
TESTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORACLE_FLAG="rustls_sort_cd5c993677488631"   # must match [solution.env] in task.toml
ORACLE_MARKER="/app/.harbor_oracle_marker"

# ---------------------------------------------------------------------------
# Prologue (order matters; see HARBOR guides anti_cheats.md §4).
# ---------------------------------------------------------------------------

# 1) Lock + wipe /logs/verifier FIRST (Harbor sets it 777 at container start).
#    Locking cuts off any agent background process; wiping removes planted files.
mkdir -p "$VERIFIER_DIR"
chmod 700 "$VERIFIER_DIR"
rm -rf "${VERIFIER_DIR:?}"/*

# Mirror all verifier output into a downloadable log (after the wipe).
exec > >(tee -a "$VERIFIER_DIR/verifier.log") 2>&1

# Relax /logs/verifier perms so the Harbor host (uid 1000) can read the reward
# files on local-Docker bind mounts. Safe to call: verification is complete and
# the agent is dead (strace fence + pre-kill) by the time the reward is written.
relax_perms() {
    chmod 755 "$VERIFIER_DIR" 2>/dev/null || true
    chmod 644 "$VERIFIER_DIR"/reward.json "$VERIFIER_DIR"/reward.txt 2>/dev/null || true
}

# Emit a reward via the standalone scorer. emit_fail <reason> [cheat=1].
emit_fail() {
    local reason="$1" cheat="$2"
    if [ "$cheat" = "1" ]; then
        python3 -ISs "$TESTS_DIR/compute_reward.py" \
            --output-dir "$VERIFIER_DIR" --fail "$reason" --cheat
    else
        python3 -ISs "$TESTS_DIR/compute_reward.py" \
            --output-dir "$VERIFIER_DIR" --fail "$reason"
    fi
    relax_perms
}

# 2) Re-lock /tests. Harbor's verify-phase upload of this script resets /tests
#    back to mode 0755 (agent-readable). A root-only /tests is what keeps the
#    authoritative fixtures + test definitions away from the agent UID.
chmod 700 /tests 2>/dev/null || true
# Restore exec bits on helper scripts (Modal/Daytona drop them; harmless locally).
find /tests -type f -name '*.sh' -exec chmod +x {} + 2>/dev/null || true

# 3) Sanitize environment side-channels (loaders, python, bash startup, cargo).
unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME BASH_ENV ENV \
      CARGO_HOME CARGO_BUILD_RUSTFLAGS RUSTFLAGS

# 4) Kill any pre-existing agent process (retry; refuse to score if it survives).
pkill -9 -u agent 2>/dev/null || true
sleep 0.5
if pgrep -u agent >/dev/null 2>&1; then
    sleep 1; pkill -9 -u agent 2>/dev/null || true; sleep 0.5
    if pgrep -u agent >/dev/null 2>&1; then
        echo "Agent processes survived kill — refusing to score."
        emit_fail "agent_processes_survived" 0
        exit 0
    fi
fi

# ---------------------------------------------------------------------------
# Working dirs. WORK_DIR / strace logs stay root-only (0700) so the agent can
# never reach the captured outputs or the decrypted oracle. STAGE_DIR / BIN_DIR
# are made traversable so the agent UID can read fixtures + exec its binary.
# ---------------------------------------------------------------------------
WORK_DIR=$(mktemp -d)
STAGE_DIR=$(mktemp -d)
BIN_DIR=$(mktemp -d)
STRACE_DIR="$WORK_DIR/strace"
mkdir -p "$STRACE_DIR"
chmod 755 "$BIN_DIR"
trap 'rm -rf "$WORK_DIR" "$STAGE_DIR" "$BIN_DIR"' EXIT

RLS_SRC="/app/workspace/rls"   # where the agent / oracle solve.sh places it
RLS="$BIN_DIR/rls"             # canonical, root-owned 0755 exec copy (run as agent)
ORACLE="$WORK_DIR/oracle_ls"   # decrypted GNU ls (root-only)

# ---------------------------------------------------------------------------
# Decrypt the oracle binary (key is only in this file, not in the image).
# Root-side, OUTSIDE strace — openssl is a root-owned system binary, not agent
# code. Refuse to score unless the oracle decrypts to a real ELF (a tampered
# ciphertext would decrypt to garbage that a trivial binary could "match").
# ---------------------------------------------------------------------------
DECRYPT_KEY="r5tL5_v3r1f1er_k3y_8f2a"
openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in /app/.test_data/oracle.enc \
    -pass pass:"$DECRYPT_KEY" \
    -out "$ORACLE" 2>/dev/null
chmod +x "$ORACLE" 2>/dev/null || true
if ! file "$ORACLE" 2>/dev/null | grep -q "ELF"; then
    echo "Oracle decryption failed or oracle.enc was tampered with."
    emit_fail "oracle_decrypt_failed" 0
    exit 0
fi

# ---------------------------------------------------------------------------
# Stage the fixtures into an agent-readable tree. /tests/fixtures is root-only,
# so the agent-UID binary cannot read it directly. `cp -a` preserves EVERY
# metadata bit ls cares about (mode, owner, setuid/setgid/sticky, mtime/atime,
# symlinks, fifos); we only relax the staging ROOT so the agent can traverse
# INTO it (the baked fixture entries are already world-rX). The oracle AND the
# agent both read this identical tree, so inode/block/owner/perm columns match.
# ---------------------------------------------------------------------------
mkdir -p "$STAGE_DIR/fixtures"
cp -a /tests/fixtures/. "$STAGE_DIR/fixtures/" 2>/dev/null
chmod 755 "$STAGE_DIR" "$STAGE_DIR/fixtures"

# ---------------------------------------------------------------------------
# Oracle marker: the oracle decrypts the baked GNU ls into $RLS_SRC and is NOT
# a Rust crate, so it bypasses build-from-source enforcement. The agent never
# sees ORACLE_FLAG, so a missing/empty/wrong marker falls through to the
# enforced (real-agent) path.
# ---------------------------------------------------------------------------
IS_ORACLE=0
if [ -f "$ORACLE_MARKER" ] && [ "$(cat "$ORACLE_MARKER" 2>/dev/null)" = "$ORACLE_FLAG" ]; then
    IS_ORACLE=1
    echo "Oracle run detected — using prebuilt $RLS_SRC as-is (build-from-source exempt)."
else
    if [ ! -f /app/workspace/Cargo.toml ]; then
        echo "No /app/workspace/Cargo.toml — deliverable is not a Rust project."
        emit_fail "not_a_rust_project" 0
        exit 0
    fi
    echo "Real agent run — enforcing build-from-source from /app/workspace."
fi

# ---------------------------------------------------------------------------
# Produce $RLS (root-owned 0755 exec copy).
#   Oracle run: copy the decrypted ls placed by solve.sh.
#   Agent run : build the crate AS the agent user, under strace, with env -i
#               (build.rs runs here), then copy the freshly built ELF.
# ---------------------------------------------------------------------------
if [ "$IS_ORACLE" = "1" ]; then
    if [ ! -f "$RLS_SRC" ]; then
        echo "Oracle run but no $RLS_SRC present."
        emit_fail "oracle_binary_missing" 0
        exit 0
    fi
    cp "$RLS_SRC" "$RLS"
    chmod 755 "$RLS"
else
    # Resolve the crate's OWN binary name from Cargo.toml so the pickup below
    # uses exactly target/release/<binname> instead of "first ELF in the glob".
    # Otherwise an agent could smuggle a differently-named prebuilt ELF (e.g.
    # target/release/aaa) that sorts before — and gets picked instead of — the
    # source build. Prefer the first [[bin]].name; fall back to package.name.
    # We emit a few deterministic spellings (cargo keeps hyphens in the bin file
    # name but underscores them for the crate name, so cover both) — every
    # candidate is derived from the crate metadata, never from arbitrary files.
    BIN_CANDS="$(python3 -ISs -c '
import sys
try:
    import tomllib
    with open("/app/workspace/Cargo.toml", "rb") as fh:
        d = tomllib.load(fh)
except Exception:
    sys.exit(1)
n = None
b = d.get("bin")
if isinstance(b, list):
    for x in b:
        if isinstance(x, dict) and x.get("name"):
            n = str(x["name"]); break
if not n:
    n = str((d.get("package") or {}).get("name") or "")
if not n:
    sys.exit(1)
s = []
for c in (n, n.replace("-", "_"), n.replace("_", "-")):
    if c and c not in s:
        s.append(c)
print("\n".join(s))
' 2>/dev/null)"
    if [ -z "$BIN_CANDS" ]; then
        echo "Could not resolve a [[bin]].name / package.name from Cargo.toml."
        emit_fail "rust_build_failed" 0
        exit 0
    fi
    echo "Crate binary name candidate(s): $(echo "$BIN_CANDS" | tr '\n' ' ')"

    # Delete any agent-supplied prebuilt binary FIRST (the legacy 'rls' name AND
    # every resolved candidate path) so a smuggled/prebuilt/C binary can never be
    # used — the deliverable MUST be built from source. Because these exact paths
    # are removed before the build, anything present at one afterwards was
    # produced by THIS build.
    rm -f "$RLS_SRC" /app/workspace/target/release/rls
    for c in $BIN_CANDS; do
        rm -f "/app/workspace/target/release/$c"
    done

    echo "=== Building agent crate AS 'agent' under strace (env -i): cargo build --release ==="
    BUILD_STRACE="$WORK_DIR/build.strace"
    BUILD_PATH="/usr/local/cargo/bin:/usr/local/bin:/usr/bin:/bin"
    strace -f -e trace=clone,clone3,fork,vfork,execve,openat \
        -o "$BUILD_STRACE" \
        timeout 3000 \
        su agent -s /bin/bash -c \
        "env -i PATH=$BUILD_PATH RUSTUP_HOME=/usr/local/rustup HOME=/home/agent TMPDIR=/tmp LC_ALL=C CARGO_HOME=/home/agent/.cargo /bin/bash -c 'cd /app/workspace && cargo build --release'" \
        2>&1 || true

    # Reward-tamper tripwire for build.rs (agent code runs during the build).
    if grep -qE 'openat\([^)]*reward\.(txt|json)[^)]*(O_WRONLY|O_RDWR|O_CREAT)' \
        "$BUILD_STRACE" 2>/dev/null; then
        echo "CHEAT DETECTED: reward file written during agent build (build.rs)."
        cp "$BUILD_STRACE" "$VERIFIER_DIR/cheat_build_strace.log" 2>/dev/null || true
        emit_fail "reward_file_manipulation" 1
        exit 0
    fi

    # Copy the freshly built ELF into the root-owned exec path (agent can exec
    # it but, since it lives in a root-owned dir, cannot replace it mid-run).
    # Pick it by the crate's OWN bin name (target/release/<binname>), NOT by a
    # "first ELF in target/release/*" glob, so a smuggled differently-named
    # prebuilt ELF is never selected. Candidates are tried in resolved order.
    for c in $BIN_CANDS; do
        bin="/app/workspace/target/release/$c"
        if [ -f "$bin" ] && [ -x "$bin" ] && file "$bin" 2>/dev/null | grep -q "ELF"; then
            cp "$bin" "$RLS"
            chmod 755 "$RLS"
            echo "Copied freshly built $bin -> $RLS"
            break
        fi
    done

    if [ ! -f "$RLS" ] || ! file "$RLS" 2>/dev/null | grep -q "ELF"; then
        echo "cargo build --release produced no ELF at target/release/<binname>."
        emit_fail "rust_build_failed" 0
        exit 0
    fi
fi

# ---------------------------------------------------------------------------
# Phase 1: oracle (root, no strace) + agent binary (as 'agent', env -i, strace).
# run_all.py writes <name>.oracle / <name>.actual into the root-only WORK_DIR
# and aborts with WORK_DIR/cheat.txt on a reward/execve tripwire.
# ---------------------------------------------------------------------------
echo "=== Phase 1: capturing oracle + agent outputs ==="
python3 -ISs "$TESTS_DIR/run_all.py" \
    "$ORACLE" "$RLS" "$TESTS_DIR" "$STAGE_DIR/fixtures" \
    "$WORK_DIR" "$STRACE_DIR" "$VERIFIER_DIR"

if [ -s "$WORK_DIR/cheat.txt" ]; then
    reason="$(cat "$WORK_DIR/cheat.txt")"
    echo "CHEAT DETECTED via strace tripwire: $reason"
    emit_fail "$reason" 1
    exit 0
fi

# ---------------------------------------------------------------------------
# Static workspace anti-cheat (no agent code runs here). Skipped for the oracle
# (its workspace legitimately holds the decrypted ls); the agent never sees the
# marker token so it cannot forge the bypass.
# ---------------------------------------------------------------------------
echo "Running static anti-cheat checks..."
CHEAT=0
if [ "$IS_ORACLE" = "1" ]; then
    echo "Oracle solution detected — skipping static anti-cheat."
else
    if grep -rq "/oracle/" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: References to oracle path"; CHEAT=1
    fi
    if grep -rq "\.test_data" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: References to encrypted test data"; CHEAT=1
    fi
    if grep -rq "oracle\.enc" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: References to encrypted oracle"; CHEAT=1
    fi
    if grep -rq "r5tL5_v3r1f1er" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Decryption key found in workspace"; CHEAT=1
    fi
    if grep -rqP "(reward\.txt|reward\.json|/logs/verifier)" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Reward hacking patterns"; CHEAT=1
    fi
    if [ -f /app/workspace/Cargo.toml ]; then
        if grep -qi "uutils\|coreutils" /app/workspace/Cargo.toml 2>/dev/null; then
            echo "CHEAT DETECTED: Banned crate (uutils/coreutils)"; CHEAT=1
        fi
    fi
    if grep -rq "ls_backup" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Using backup ls binary"; CHEAT=1
    fi
    if grep -rqP "/usr/bin/(dir|vdir)\b" /app/workspace/ 2>/dev/null; then
        echo "CHEAT DETECTED: Using dir/vdir coreutils variant"; CHEAT=1
    fi
    # The submitted binary must not be a byte-for-byte copy of the oracle ls.
    if [ -x "$ORACLE" ] && [ -x "$RLS" ]; then
        ORACLE_HASH=$(sha256sum "$ORACLE" | cut -d' ' -f1)
        RLS_HASH=$(sha256sum "$RLS" | cut -d' ' -f1)
        if [ "$ORACLE_HASH" = "$RLS_HASH" ]; then
            echo "CHEAT DETECTED: Binary is identical to oracle ls"; CHEAT=1
        fi
    fi
fi

if [ "$CHEAT" -eq 1 ]; then
    emit_fail "anti_cheat_triggered" 1
    exit 0
fi
echo "Anti-cheat: PASSED"

# ---------------------------------------------------------------------------
# Phase 2: score by diffing the captured outputs (no agent code executes here).
# Per-test pass/fail is written to a subscores file; compute_reward.py applies
# the (unchanged) per-tier weights and writes the reward atomically.
# ---------------------------------------------------------------------------
echo "=== Phase 2: scoring (root, outside strace) ==="
SUBSCORES_TXT="$WORK_DIR/subscores.txt"
: > "$SUBSCORES_TXT"

for tier_dir in "$TESTS_DIR"/tier*; do
    [ -d "$tier_dir" ] || continue
    tier=$(basename "$tier_dir")
    pass=0
    total=0
    for test_file in "$tier_dir"/*.json; do
        [ -f "$test_file" ] || continue
        test_name=$(basename "$test_file" .json)
        total=$((total + 1))
        oracle_file="$WORK_DIR/${test_name}.oracle"
        actual_file="$WORK_DIR/${test_name}.actual"
        if [ -f "$actual_file" ] && [ -f "$oracle_file" ] \
            && diff -q "$actual_file" "$oracle_file" > /dev/null 2>&1; then
            pass=$((pass + 1))
            echo "$tier/$test_name 1" >> "$SUBSCORES_TXT"
        else
            if [ ! -s "$actual_file" ]; then
                echo "  FAIL $test_name (timeout/crash/empty)"
            else
                echo "  FAIL $test_name (mismatch)"
            fi
            diff -u "$oracle_file" "$actual_file" > "$VERIFIER_DIR/${test_name}.diff" 2>/dev/null || true
            echo "$tier/$test_name 0" >> "$SUBSCORES_TXT"
        fi
    done
    echo "  $tier: $pass/$total"
done

python3 -ISs "$TESTS_DIR/compute_reward.py" \
    --output-dir "$VERIFIER_DIR" --subscores "$SUBSCORES_TXT"
relax_perms

exit 0
