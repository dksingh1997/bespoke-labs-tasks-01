#!/usr/bin/env python3
"""rust-ls Phase-1 executor (runs as ROOT, invoked by tests/test.sh).

For every test case it:

  * Runs the TRUSTED oracle ``ls`` (root, NO strace) over the STAGED fixtures
    and records the normalized expected output  -> ``<name>.oracle``.
    The oracle decrypt + this generation are the only places the real
    $ORACLE / $TESTS_DEFS_DIR / authoritative fixtures are touched, and they
    are root-side, outside strace.

  * Runs the agent deliverable as the NON-ROOT ``agent`` user, under
    ``strace -f``, with a SCRUBBED environment (``env -i ...``). Because of
    ``env -i`` the binary inherits NONE of the verifier's variables — the
    $ORACLE / $FIXTURES / $TESTS_DEFS_DIR paths simply do not exist in its
    environment. The per-case fixture path is handed over ONLY as an argv.
    Output is captured through a root-held pipe (the agent never gets an FD or
    path into the root-only result directory)  -> ``<name>.actual``.

  * Inspects the per-case strace log for (a) a write-mode open of
    reward.{txt,json} and (b) an ``execve`` of ``ls`` / ``dir`` / ``vdir`` /
    the decrypted-oracle basename (the cheat tripwire). Either one writes
    WORK_DIR/cheat.txt and aborts; test.sh turns that into a zero-with-cheat.

Argv: oracle_bin rls_bin tests_dir staged_fixtures_dir out_dir strace_dir verifier_dir
"""
import glob
import json
import os
import re
import shlex
import shutil
import subprocess
import sys

oracle_bin = sys.argv[1]    # decrypted GNU ls (lives in root-only WORK_DIR)
rls_bin = sys.argv[2]       # agent deliverable: root-owned 0755 exec copy
tests_dir = sys.argv[3]     # /tests (root-only) -- read here as ROOT only
fixtures_dir = sys.argv[4]  # STAGED fixtures (agent-readable copy)
out_dir = sys.argv[5]       # root-only WORK_DIR for .oracle/.actual + cheat.txt
strace_dir = sys.argv[6]    # root-only dir for per-case strace logs
verifier_dir = sys.argv[7]  # /logs/verifier (offending strace log is copied here)

# PATH handed to the agent binary. Absolute argv is used, so PATH is only a
# courtesy; the toolchain dir is included to mirror the build environment.
AGENT_PATH = "/usr/local/cargo/bin:/usr/local/bin:/usr/bin:/bin"

# Environment that AFFECTS ls output. IDENTICAL for the oracle and the agent
# runs so a correct implementation is byte-for-byte comparable.
BASE_OUT_ENV = {
    "LC_ALL": "C",
    "TZ": "UTC",
    "COLUMNS": "80",
    "TERM": "xterm-256color",
}

# execve of any of these basenames by the agent binary is a cheat (it is trying
# to shell out to the real ls / a coreutils variant / the decrypted oracle).
BANNED_EXEC = {"ls", "dir", "vdir", os.path.basename(oracle_bin)}

REWARD_RE = re.compile(
    r"openat\([^)]*reward\.(?:txt|json)[^)]*(?:O_WRONLY|O_RDWR|O_CREAT)"
)
EXECVE_RE = re.compile(r'execve\("(?:[^"]*/)?([^"/]+)"')


def normalize(text):
    lines = text.split("\n")
    cleaned = [l.rstrip() for l in lines]
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\n".join(cleaned) + "\n" if cleaned else ""


def case_args(tc):
    """Resolve the argv paths (always inside the STAGED fixtures tree)."""
    fx = os.path.join(fixtures_dir, tc["fixture"])
    args = tc.get("args")
    return [os.path.join(fx, a) for a in args] if args else [fx]


def run_oracle(tc):
    """Trusted oracle ls, root-side, no strace."""
    flags = tc.get("flags", [])
    timeout = tc.get("timeout", 10)
    env = dict(BASE_OUT_ENV)
    env["PATH"] = AGENT_PATH
    env.update(tc.get("env_extra", {}))
    cmd = [oracle_bin] + flags + case_args(tc)
    try:
        r = subprocess.run(cmd, capture_output=True, env=env, timeout=timeout)
        return normalize(r.stdout.decode("utf-8", errors="replace"))
    except Exception:
        return ""


def run_agent(tc, log_path):
    """Agent deliverable as the `agent` user under strace, scrubbed env."""
    flags = tc.get("flags", [])
    timeout = tc.get("timeout", 10)
    env = dict(BASE_OUT_ENV)
    env["PATH"] = AGENT_PATH
    env["HOME"] = "/home/agent"
    env["TMPDIR"] = "/tmp"
    env["RUSTUP_HOME"] = "/usr/local/rustup"
    env.update(tc.get("env_extra", {}))

    # env -i wipes the inherited environment; we then re-add ONLY the
    # output-affecting + toolchain vars. The $ORACLE / $FIXTURES /
    # $TESTS_DEFS_DIR paths are never placed here -> not reachable via env.
    inner = (
        "env -i "
        + " ".join("{}={}".format(k, shlex.quote(str(v))) for k, v in env.items())
        + " "
        + " ".join(shlex.quote(x) for x in ([rls_bin] + flags + case_args(tc)))
    )
    cmd = [
        "strace", "-f",
        "-e", "trace=clone,clone3,fork,vfork,execve,openat",
        "-o", log_path,
        "timeout", str(timeout),
        "su", "agent", "-s", "/bin/bash", "-c", inner,
    ]
    try:
        r = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            timeout=timeout + 30,
        )
        return normalize(r.stdout.decode("utf-8", errors="replace"))
    except Exception:
        return ""


def scan_strace(log_path):
    """Return (reward_tamper: bool, banned_exec_name: str|None)."""
    reward = False
    banned = None
    try:
        with open(log_path, "r", errors="replace") as f:
            for line in f:
                if "execve(" in line and banned is None:
                    m = EXECVE_RE.search(line)
                    if m and m.group(1) in BANNED_EXEC:
                        banned = m.group(1)
                if not reward and "reward." in line and REWARD_RE.search(line):
                    reward = True
                if reward and banned:
                    break
    except FileNotFoundError:
        pass
    return reward, banned


def flag_cheat(reason, log_path=None):
    with open(os.path.join(out_dir, "cheat.txt"), "w") as f:
        f.write(reason + "\n")
    if log_path and os.path.exists(log_path):
        try:
            shutil.copy(log_path, os.path.join(verifier_dir, "cheat_strace.log"))
        except Exception:
            pass
    print("CHEAT DETECTED (strace tripwire): {}".format(reason))


def main():
    cases = []
    for tier_dir in sorted(glob.glob(os.path.join(tests_dir, "tier*"))):
        for test_file in sorted(glob.glob(os.path.join(tier_dir, "*.json"))):
            with open(test_file) as f:
                cases.append(json.load(f))

    print(
        "Executing {} cases (oracle root-side; agent binary as 'agent', "
        "env -i, under strace)...".format(len(cases))
    )
    for tc in cases:
        name = tc["name"]
        with open(os.path.join(out_dir, name + ".oracle"), "w") as f:
            f.write(run_oracle(tc))

        log_path = os.path.join(strace_dir, name + ".log")
        actual = run_agent(tc, log_path)

        reward_tamper, banned = scan_strace(log_path)
        if reward_tamper:
            flag_cheat("reward_file_manipulation", log_path)
            return 0
        if banned:
            flag_cheat("execve_banned_binary:" + banned, log_path)
            return 0

        with open(os.path.join(out_dir, name + ".actual"), "w") as f:
            f.write(actual)
        # Keep WORK_DIR small; non-offending logs are not needed downstream.
        try:
            os.remove(log_path)
        except OSError:
            pass

    print("Phase 1 complete: no strace tripwire fired.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
