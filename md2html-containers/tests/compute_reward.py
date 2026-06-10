#!/usr/bin/env python3
"""Reward computation for the markdown-html verifier.

Runs as ROOT, OUTSIDE the strace window, invoked as `python3 -ISs`. Reads ONLY
the CLI counters that test.sh maintains (plus an optional root-written
failed-cases list under the 0700 verifier dir). It never imports or reads
anything from /app or any agent-writable path, so the reward cannot be forged.

Scoring (UNCHANGED from the original verifier):
    50% correctness  (fraction of visible + hidden cases passed)
    50% performance  (median-of-3 speed vs the cmark reference)

Performance is GATED by correctness: the raw speed ratio is multiplied by the
correctness fraction so a fast-but-wrong binary (e.g. the starter md2html that
emits an empty string near-instantly) collapses to ~0 instead of harvesting
half the score for doing nothing. Empty categories redistribute their weight.

reward.json / reward.txt are written atomically via os.replace().
"""
import argparse
import json
import os
import sys

W_CORRECT = 0.50
W_PERF = 0.50

_ERROR_LABELS = {
    "compilation_failed": "compilation_failed",
    "cheat_detected": "cheat_detected",
    "external_converter_execve": "external_converter_execve",
    "reward_file_manipulation": "reward_file_manipulation",
    "agent_processes_survived": "agent_processes_survived",
    "staging_failed": "staging_failed",
    "incomplete": "verifier_incomplete",
}


def _write_atomic(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(data)
    os.replace(tmp, path)


def write_reward(outdir, score, subscores, additional):
    os.makedirs(outdir, exist_ok=True)
    score = round(float(score), 4)
    reward = {
        "score": score,
        "reward": score,
        "subscores": subscores,
        "additional_data": additional,
    }
    _write_atomic(os.path.join(outdir, "reward.json"),
                  json.dumps(reward, indent=2))
    _write_atomic(os.path.join(outdir, "reward.txt"), str(score))
    print(json.dumps(reward, indent=2))


def _read_failed(path):
    if not path:
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return [ln.strip() for ln in f if ln.strip()]
    except OSError:
        return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output-dir", required=True)
    ap.add_argument("--fail", help="Non-scoring outcome (forces score=0)")
    ap.add_argument("--correctness-passed", type=int, default=0)
    ap.add_argument("--correctness-total", type=int, default=0)
    ap.add_argument("--perf-total", type=int, default=0)
    ap.add_argument("--perf-score-sum", type=float, default=0.0)
    ap.add_argument("--total-time-s", type=int, default=0)
    ap.add_argument("--failed-cases-file", default="")
    args = ap.parse_args()

    if args.fail:
        error = _ERROR_LABELS.get(args.fail, "verifier_error")
        print(f"  Non-scoring outcome: {error}  (score = 0.0)")
        subscores = [
            {"subtask": "correctness", "score": 0.0},
            {"subtask": "performance", "score": 0.0},
        ]
        additional = {"composite_score": 0.0, "error": error,
                      "total_time_s": args.total_time_s}
        write_reward(args.output_dir, 0.0, subscores, additional)
        return 0

    correctness_passed = args.correctness_passed
    correctness_total = args.correctness_total
    perf_total = args.perf_total
    perf_score_sum = args.perf_score_sum

    correctness_rate = (correctness_passed / correctness_total
                        if correctness_total > 0 else 0.0)
    perf_rate_raw = (perf_score_sum / perf_total
                     if perf_total > 0 else 0.0)

    # --- Correctness gate on performance (smooth, monotonic; no cliff) ---
    perf_rate = round(perf_rate_raw * correctness_rate, 4)

    active_weight = 0.0
    if correctness_total > 0:
        active_weight += W_CORRECT
    if perf_total > 0:
        active_weight += W_PERF

    scale = (1.0 / active_weight) if active_weight > 0 else 0.0
    w_c = (W_CORRECT * scale) if correctness_total > 0 else 0.0
    w_p = (W_PERF * scale) if perf_total > 0 else 0.0

    composite = round(w_c * correctness_rate + w_p * perf_rate, 4)

    failed = _read_failed(args.failed_cases_file)

    print()
    print(f"  Correctness rate:  {correctness_rate:.4f}  (weight {w_c:.2f})")
    print(f"  Performance raw:   {perf_rate_raw:.4f}")
    print(f"  Performance gated: {perf_rate:.4f}  "
          f"(raw x correctness {correctness_rate:.4f}, weight {w_p:.2f})")
    print(f"  --")
    print(f"  Composite score:   {composite:.4f}")
    print()

    subscores = [
        {"subtask": "correctness", "score": round(correctness_rate, 4)},
        {"subtask": "performance", "score": round(perf_rate, 4)},
    ]
    additional = {
        "composite_score": composite,
        "correctness": {
            "passed": correctness_passed,
            "total": correctness_total,
            "rate": round(correctness_rate, 4),
            "weight": round(w_c, 4),
        },
        "performance": {
            "total": perf_total,
            "score_sum": round(perf_score_sum, 4),
            "raw_rate": round(perf_rate_raw, 4),
            "rate": round(perf_rate, 4),
            "correctness_gate": round(correctness_rate, 4),
            "weight": round(w_p, 4),
        },
        "total_time_s": args.total_time_s,
        "failed_cases": failed[:50],
    }
    write_reward(args.output_dir, composite, subscores, additional)
    return 0


if __name__ == "__main__":
    sys.exit(main())
