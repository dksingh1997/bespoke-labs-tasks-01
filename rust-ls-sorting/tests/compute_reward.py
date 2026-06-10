#!/usr/bin/env python3
"""Standalone reward computation for rust-ls.

Runs as ``python3 -ISs`` (isolated: no site-packages, no PYTHON* env, no
implicit cwd on sys.path), as ROOT, OUTSIDE the strace window. It reads ONLY
its CLI args plus a verifier-written subscores file; it never imports or reads
anything under /app or any agent-writable path. reward.json + reward.txt are
written atomically (tmpfile + ``os.replace``) so a crashed/half-written reward
can never be observed.

Tier weights and the weighted-sum scoring are IDENTICAL to the previous inline
shell/bc logic.

Usage:
    # success: derive the weighted score from per-test pass/fail lines
    compute_reward.py --output-dir /logs/verifier --subscores /path/subscores.txt

    # hard failure (plain zero, multiplier 1.0)
    compute_reward.py --output-dir /logs/verifier --fail not_a_rust_project

    # cheating gate (zero, multiplier 0.0)
    compute_reward.py --output-dir /logs/verifier --fail reward_file_manipulation --cheat
"""
import argparse
import json
import os
import sys

# Scoped variant: this task only curates tier2 (long format), so its weight is
# re-normalized to 1.0. Tiers outside the scope are never generated and so never
# Scoped variant: only the in-scope tiers (tier3_sorting) are curated, so
# their weights are re-normalized to sum to 1.0 (equal split). Out-of-scope
# tiers are never generated and are listed at 0.0 for documentation only.
WEIGHTS = {
    "tier1_basic": 0.000000,
    "tier2_long_format": 0.000000,
    "tier3_sorting": 1.000000,
    "tier4_formatting": 0.000000,
    "tier5_symlinks_recursion": 0.000000,
    "tier6_quoting_escaping": 0.000000,
    "tier7_time_size": 0.000000,
    "tier8_color_advanced": 0.000000,
    "tier9_performance": 0.000000,
}


def clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def write_atomic(outdir, payload):
    """Write reward.json + reward.txt atomically via tmpfile + os.replace."""
    os.makedirs(outdir, exist_ok=True)
    for fname, content in (
        ("reward.json", json.dumps(payload, indent=2)),
        ("reward.txt", "{}\n".format(payload["score"])),
    ):
        path = os.path.join(outdir, fname)
        tmp = path + ".tmp"
        with open(tmp, "w") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)


def emit_fail(outdir, reason, cheat):
    payload = {
        "score": 0.0,
        "reward": 0.0,
        "subscores": [],
        "additional_data": {
            "tests_passed": 0,
            "tests_total": 0,
            "pass_rate": 0,
            "cheating_penalty_multiplier": 0.0 if cheat else 1.0,
            "cheating_reasons": [reason] if cheat else [],
            "status": "failed",
            "reason": reason,
        },
    }
    write_atomic(outdir, payload)
    print("FAIL: {} (cheat={})".format(reason, bool(cheat)))


def emit_score(outdir, subscores_path):
    subscores = []
    tier_pass = {}
    tier_total = {}
    total_pass = 0
    total_tests = 0

    if subscores_path and os.path.exists(subscores_path):
        with open(subscores_path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                subtask, val = line.rsplit(" ", 1)
                v = int(val)
                subscores.append({"subtask": subtask, "score": v})
                tier = subtask.split("/", 1)[0]
                tier_total[tier] = tier_total.get(tier, 0) + 1
                tier_pass[tier] = tier_pass.get(tier, 0) + v
                total_tests += 1
                total_pass += v

    score = 0.0
    for tier, total in tier_total.items():
        if total <= 0:
            continue
        rate = tier_pass.get(tier, 0) / total
        score += rate * WEIGHTS.get(tier, 0.0)
    score = round(clamp(score), 6)

    payload = {
        "score": score,
        "reward": score,
        "subscores": subscores,
        "additional_data": {
            "tests_passed": total_pass,
            "tests_total": total_tests,
            "pass_rate": (total_pass / total_tests) if total_tests > 0 else 0,
            "cheating_penalty_multiplier": 1.0,
            "cheating_reasons": [],
        },
    }
    write_atomic(outdir, payload)
    print("Reward: {} ({}/{} passed)".format(score, total_pass, total_tests))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--output-dir", required=True)
    p.add_argument("--fail", dest="fail")
    p.add_argument("--cheat", action="store_true")
    p.add_argument("--subscores")
    args = p.parse_args()

    if args.fail is not None:
        emit_fail(args.output_dir, args.fail, args.cheat)
    else:
        emit_score(args.output_dir, args.subscores)
    return 0


if __name__ == "__main__":
    sys.exit(main())
