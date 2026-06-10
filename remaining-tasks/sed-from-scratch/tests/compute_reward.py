#!/usr/bin/env python3
"""Compute tiered reward for the sed-from-scratch task.

Tests come from two sources:
  1. GNU sed's own test suite (.sed/.inp/.good triplets)
  2. Custom CLI tests (in-place editing, flags, etc.)

All test IDs start with a tier prefix (t1_ .. t7_).

Runs OUTSIDE strace and never imports or executes agent code — it only parses the
test_results.txt summary and reads /app/mysed.c as text for the source-integrity
gate. Emits reward.json (score + subscores + additional_data) plus reward.txt.
"""

import argparse
import json
import os
import tempfile

OUTPUT_DIR = "/logs/verifier"
DEFAULT_RESULTS = "/logs/verifier/test_results.txt"

# Oracle detection: solve.sh writes HARBOR_ORACLE_FLAG (injected only into oracle
# runs via [solution.env]) to ORACLE_MARKER. The agent owns /app and can create
# the marker file, but never sees the token, so it cannot forge its contents.
ORACLE_MARKER = "/app/.harbor_oracle_marker"
ORACLE_FLAG = "sed_from_scratch_882886efd1ebeec5"  # must match [solution.env] in task.toml

TIERS = {
    "t1": {"weight": 0.03, "name": "Basic Commands"},
    "t2": {"weight": 0.05, "name": "Addressing & Escaping"},
    "t3": {"weight": 0.07, "name": "Substitution Features"},
    "t4": {"weight": 0.10, "name": "Hold Space & Multi-line"},
    "t5": {"weight": 0.15, "name": "Complex Scripts & File I/O"},
    "t6": {"weight": 0.25, "name": "Edge Cases & Programs"},
    "t7": {"weight": 0.35, "name": "Stress Tests"},
}


def parse_results(path):
    results = {}
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return results
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split()
            if len(parts) >= 2:
                results[parts[0]] = parts[1]
    return results


def anti_gaming_penalty():
    # Oracle bypass requires BOTH the marker file AND its contents matching the
    # secret token. A bare `touch` of the marker (forged by the agent) no longer
    # disables the source gate.
    try:
        with open(ORACLE_MARKER) as fh:
            if fh.read().strip() == ORACLE_FLAG:
                return 1.0
    except OSError:
        pass

    src = "/app/mysed.c"
    if not os.path.exists(src):
        return 0.1

    with open(src) as f:
        code = f.read()
    lines = [l for l in code.split("\n") if l.strip()]

    if len(lines) < 50:
        return 0.1

    banned = [
        'system(', 'popen(',
        '"/usr/bin/sed"', '"/bin/sed"',
        "'/usr/bin/sed'", "'/bin/sed'",
        'execvp("sed"', 'execlp("sed"',
        'execv("/usr/bin/sed"', 'execv("/bin/sed"',
    ]
    for b in banned:
        if b in code:
            return 0.1

    return 1.0


def _write_atomic(path, payload):
    """Write payload to path atomically (tempfile + os.replace) so a reader
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


def write_reward(score, subscores, additional_data):
    """Emit the canonical reward.json (score + subscores + additional_data) and
    a numeric reward.txt. `score` doubles as the `reward` alias for Harbor's
    reward.txt fallback. Both files are written atomically via os.replace."""
    score = round(score, 4)
    output = {
        "score": score,
        "reward": score,
        "subscores": subscores,
        "additional_data": additional_data,
    }
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    _write_atomic(os.path.join(OUTPUT_DIR, "reward.json"), json.dumps(output, indent=2))
    _write_atomic(os.path.join(OUTPUT_DIR, "reward.txt"), str(score))
    print(json.dumps(output, indent=2))


def compute(results_path):
    results = parse_results(results_path)

    tier_scores = {}
    for prefix, info in TIERS.items():
        tier_tests = {k: v for k, v in results.items() if k.startswith(prefix + "_")}
        total = len(tier_tests)
        passed = sum(1 for v in tier_tests.values() if v == "PASS")
        score = passed / total if total > 0 else 0.0
        tier_scores[prefix] = {
            "name": info["name"],
            "weight": info["weight"],
            "passed": passed,
            "total": total,
            "score": score,
        }

    raw_reward = sum(tier_scores[t]["score"] * TIERS[t]["weight"] for t in TIERS)

    penalty = anti_gaming_penalty()
    reward = raw_reward * penalty

    subscores = [
        {
            "subtask": f"{prefix} {tier_scores[prefix]['name']}",
            "score": round(tier_scores[prefix]["score"], 4),
            "weight": tier_scores[prefix]["weight"],
            "passed": tier_scores[prefix]["passed"],
            "total": tier_scores[prefix]["total"],
        }
        for prefix in TIERS
    ]

    additional_data = {
        "raw_reward": round(raw_reward, 4),
        "anti_gaming_multiplier": penalty,
        "tiers": tier_scores,
    }

    write_reward(reward, subscores, additional_data)


def main():
    ap = argparse.ArgumentParser(description="Compute sed-from-scratch task reward")
    ap.add_argument(
        "results", nargs="?", default=DEFAULT_RESULTS,
        help="Path to test_results.txt (default: %(default)s)",
    )
    ap.add_argument(
        "--fail", dest="fail", default=None,
        help="Hard-failure reason (e.g. reward_file_manipulation); writes score 0",
    )
    args = ap.parse_args()

    if args.fail:
        write_reward(
            0.0,
            [{"subtask": "anti_cheat", "score": 0.0}],
            {"status": "failed", "reason": args.fail},
        )
        return

    compute(args.results)


if __name__ == "__main__":
    main()
