#!/usr/bin/env python3
"""Compute tiered reward for elf-linker-from-scratch task.

Tiers (weight increases with difficulty):
  T1 (0.08): Basic ELF -- single .o, inline syscall
  T2 (0.12): Cross-file linking -- function calls, data sections
  T3 (0.16): BSS + archive -- .bss section, .a parsing
  T4 (0.24): Structural + musl hello -- mold-adapted tests
  T5 (0.40): Complex musl -- printf, multi-file, common symbols

Anti-gaming: source code is inspected for banned patterns.

Runs OUTSIDE strace and never imports or executes agent code -- it only reads
the JSON results file the verifier wrote and the agent's myld.c as text. Emits
/logs/verifier/reward.json (canonical) and reward.txt (fallback float).
"""

import argparse
import json
import os
import sys
import tempfile

RESULTS_FILE = "/logs/verifier/test_results.json"
SOURCE_FILE = "/app/myld.c"

# Oracle detection: solve.sh writes HARBOR_ORACLE_FLAG (injected only into oracle
# runs via [solution.env]) to ORACLE_MARKER. The agent owns /app and can create
# the marker file, but never sees the token, so it cannot forge its contents.
ORACLE_MARKER = "/app/.harbor_oracle_marker"
ORACLE_FLAG = "elf_linker_from_scratch_6b80ca3b1b849ab5"  # must match [solution.env] in task.toml

TIERS = {
    "t1": {"weight": 0.08, "tests": ["t1_t1_exit", "t1_t1_exit_elf"]},
    "t2": {"weight": 0.12, "tests": ["t2_t2_hello", "t2_t2_data", "t2_t2_hello_elf"]},
    "t3": {"weight": 0.16, "tests": ["t3_t3_bss", "t3_t3_archive"]},
    "t4": {"weight": 0.24, "tests": ["t4_entry", "t4_sections", "t4_nostdlib", "t4_hello_libc"]},
    "t5": {"weight": 0.40, "tests": ["t5_printf", "t5_multi", "t5_common"]},
}

BANNED_PATTERNS = [
    'execvp("ld"',
    "execvp(\"ld\"",
    'execvp("gcc"',
    "execvp(\"gcc\"",
    'execvp("musl-gcc"',
    "execvp(\"musl-gcc\"",
    "system(",
    "popen(",
    'execvp("collect2"',
    "execvp(\"collect2\"",
]

MIN_CODE_LINES = 150


def load_results():
    try:
        if not os.path.exists(RESULTS_FILE):
            print("No results file found", file=sys.stderr)
            return {}
        with open(RESULTS_FILE) as f:
            data = json.load(f)
        return data.get("tests", {})
    except Exception as exc:  # malformed/partial results => unscorable => 0
        print(f"results parse error: {exc}", file=sys.stderr)
        return {}


def check_anti_gaming():
    """Return (is_clean, reason) -- skipped only for genuine oracle runs.

    Oracle bypass requires BOTH the marker file AND its contents matching the
    secret token. A bare `touch` of the marker (forged by the agent) no longer
    disables the source gate.
    """
    try:
        with open(ORACLE_MARKER) as f:
            if f.read().strip() == ORACLE_FLAG:
                return True, "oracle bypass"
    except OSError:
        pass

    if not os.path.exists(SOURCE_FILE):
        return False, "source file not found"

    with open(SOURCE_FILE) as f:
        source = f.read()

    source_lower = source.lower()

    for pattern in BANNED_PATTERNS:
        if pattern.lower() in source_lower:
            return False, f"banned pattern: {pattern}"

    non_blank = sum(1 for line in source.splitlines() if line.strip())
    if non_blank < MIN_CODE_LINES:
        return False, f"too short: {non_blank} non-blank lines (need {MIN_CODE_LINES})"

    return True, "clean"


def _write_atomic(path, payload):
    """Write `payload` to `path` atomically (tempfile + os.replace) so a reader
    never observes a half-written reward file."""
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".reward.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            f.write(payload)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def write_reward(outdir, score, subscores, **extra):
    """Emit reward.json (canonical) + reward.txt (fallback float), atomically."""
    payload = {
        "score": score,
        "reward": score,
        "subscores": subscores,
        "additional_data": extra,
    }
    os.makedirs(outdir, exist_ok=True)
    _write_atomic(os.path.join(outdir, "reward.json"),
                  json.dumps(payload, indent=2) + "\n")
    _write_atomic(os.path.join(outdir, "reward.txt"), f"{score}\n")
    print(f"Reward: {score}")


def compute(outdir):
    results = load_results()
    is_clean, reason = check_anti_gaming()

    total_reward = 0.0
    tier_details = {}
    subscores = []

    for tier_name, tier_info in TIERS.items():
        tests = tier_info["tests"]
        weight = tier_info["weight"]

        passed = sum(1 for t in tests if results.get(t) == "pass")
        fraction = passed / len(tests) if tests else 0
        tier_reward = weight * fraction
        total_reward += tier_reward

        tier_details[tier_name] = {
            "passed": passed,
            "total": len(tests),
            "fraction": round(fraction, 3),
            "weight": weight,
            "weighted": round(tier_reward, 4),
        }
        # Per-tier subscore: pass fraction for that tier (pre-gate).
        subscores.append({"subtask": tier_name, "score": round(fraction, 4)})

    pre_gate_total = round(min(max(total_reward, 0.0), 1.0), 4)

    if not is_clean:
        penalty = total_reward
        total_reward = 0.0
        print(f"ANTI-GAMING PENALTY: {reason} (lost {penalty:.4f})", file=sys.stderr)

    total_reward = round(min(max(total_reward, 0.0), 1.0), 4)

    print("\n=== Reward Breakdown ===")
    for tier_name in sorted(tier_details):
        d = tier_details[tier_name]
        print(f"  {tier_name}: {d['passed']}/{d['total']} passed, "
              f"fraction={d['fraction']}, weighted={d['weighted']}")
    print(f"  Anti-gaming: {reason}")
    print(f"  Total reward: {total_reward}")

    tests_passed = sum(1 for tier in TIERS.values()
                       for t in tier["tests"] if results.get(t) == "pass")
    tests_total = sum(len(tier["tests"]) for tier in TIERS.values())

    write_reward(
        outdir,
        total_reward,
        subscores,
        status="ok",
        anti_gaming_clean=is_clean,
        anti_gaming_reason=reason,
        pre_gate_total=pre_gate_total,
        tests_passed=tests_passed,
        tests_total=tests_total,
        tier_details=tier_details,
    )

    # Trailing float for backward-compatible stdout capture.
    print(total_reward)


def main():
    ap = argparse.ArgumentParser(description="Compute elf-linker task reward")
    ap.add_argument("--fail", help="Hard failure reason (writes score=0)")
    ap.add_argument("--output-dir", default="/logs/verifier")
    args = ap.parse_args()

    if args.fail:
        subscores = [{"subtask": t, "score": 0.0} for t in TIERS]
        write_reward(
            args.output_dir, 0.0, subscores,
            status="failed", reason=args.fail,
        )
        return

    compute(args.output_dir)


if __name__ == "__main__":
    main()
