#!/usr/bin/env python3
"""Compute tiered reward for the sed-from-scratch task.

Tests come from two sources:
  1. GNU sed's own test suite (.sed/.inp/.good triplets)
  2. Custom CLI tests (in-place editing, flags, etc.)

All test IDs start with a tier prefix (t1_ .. t7_).
"""

import json
import os
import sys

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
    if os.path.exists("/app/.oracle_marker"):
        return 1.0

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


def compute():
    results_path = sys.argv[1] if len(sys.argv) > 1 else "/logs/verifier/test_results.txt"
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

    output = {
        "reward": round(reward, 4),
        "raw_reward": round(raw_reward, 4),
        "anti_gaming_multiplier": penalty,
        "tiers": tier_scores,
    }

    os.makedirs("/logs/verifier", exist_ok=True)
    with open("/logs/verifier/reward.json", "w") as f:
        json.dump(output, f, indent=2)
    with open("/logs/verifier/reward.txt", "w") as f:
        f.write(str(round(reward, 4)))

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    compute()
