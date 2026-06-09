#!/usr/bin/env python3
"""Compute reward score for PCC optimization task (PCC-Bootstrap Mode).

Compares modified PCC vs baseline PCC (NOT vs GCC).

Reward is based on:
  - Correctness gate: No regressions compared to baseline PCC
  - Performance: Speedup of modified PCC over baseline PCC

IMPORTANT: Reward is purely about improvement over baseline PCC.
No improvement = reward 0. Any speedup = positive reward.
Reward scale is calibrated against GCC -O3 as the theoretical ceiling (~2.59x).
"""

import sys
import csv
import json
import math
import os
import tempfile
from collections import defaultdict

def load_benchmark_csv(path):
    """Load benchmark suite results CSV."""
    results = []
    if not os.path.exists(path):
        print(f"WARNING: Benchmark CSV not found: {path}")
        return results
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            results.append(row)
    return results

def load_correctness_csv(path):
    """Load correctness test results CSV."""
    results = []
    if not os.path.exists(path):
        print(f"WARNING: Correctness CSV not found: {path}")
        return results
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            results.append(row)
    return results

def compute_correctness_score(baseline_correctness, modified_correctness):
    """Compute correctness score by comparing baseline vs modified PCC.

    Returns (gated, baseline_pass, baseline_fail, modified_pass, modified_fail,
             regressions, fixes).
      - gated: True if any regression detected
      - regressions: tests that baseline passed but modified failed
      - fixes: tests that baseline failed but modified passed
    """
    # Build result dictionaries from separate CSVs
    baseline_results = {}
    modified_results = {}

    for row in baseline_correctness:
        test_name = row['test']
        baseline_results[test_name] = row['result']

    for row in modified_correctness:
        test_name = row['test']
        modified_results[test_name] = row['result']

    # Count passes and fails
    baseline_pass = sum(1 for r in baseline_results.values() if r == 'PASS')
    baseline_fail = sum(1 for r in baseline_results.values() if r in ('FAIL', 'COMPILE_FAIL'))
    modified_pass = sum(1 for r in modified_results.values() if r == 'PASS')
    modified_fail = sum(1 for r in modified_results.values() if r in ('FAIL', 'COMPILE_FAIL'))

    # Detect regressions: tests that baseline passed but modified failed
    regressions = []
    for test_name, baseline_result in baseline_results.items():
        modified_result = modified_results.get(test_name, 'SKIP')
        if baseline_result == 'PASS' and modified_result in ('FAIL', 'COMPILE_FAIL'):
            regressions.append(test_name)

    # Detect fixes: tests that baseline failed but modified passed
    fixes = []
    for test_name, baseline_result in baseline_results.items():
        modified_result = modified_results.get(test_name, 'SKIP')
        if baseline_result in ('FAIL', 'COMPILE_FAIL') and modified_result == 'PASS':
            fixes.append(test_name)

    # Gate if any regressions
    gated = len(regressions) > 0

    return gated, baseline_pass, baseline_fail, modified_pass, modified_fail, \
           sorted(regressions), sorted(fixes)

def compute_performance_score(baseline_results, modified_results):
    """Compute performance score: speedup of modified PCC over baseline PCC.

    For each benchmark:
      - CoreMark: higher is better (iterations/sec)
      - Others: lower is better (time in seconds)

    Returns (speedup_ratio, num_benchmarks, details).
      - speedup_ratio: geometric mean of (modified_speed / baseline_speed)
      - A ratio > 1.0 means modified is faster than baseline
    """
    # Suites where runtime_sec is throughput (higher = better)
    THROUGHPUT_SUITES = {'coremark'}

    # Collect runtimes by (suite, benchmark)
    baseline_runtimes = {}
    modified_runtimes = {}

    for row in baseline_results:
        if row['status'] != 'OK':
            continue
        key = (row['suite'], row['benchmark'])
        runtime = float(row['runtime_sec'])
        if runtime > 0:
            baseline_runtimes[key] = runtime

    for row in modified_results:
        if row['status'] != 'OK':
            continue
        key = (row['suite'], row['benchmark'])
        runtime = float(row['runtime_sec'])
        if runtime > 0:
            modified_runtimes[key] = runtime

    # Compute speedup ratios
    ratios = []
    details = []

    for key in sorted(baseline_runtimes.keys()):
        if key not in modified_runtimes:
            continue

        baseline_val = baseline_runtimes[key]
        modified_val = modified_runtimes[key]
        suite = key[0]

        if suite in THROUGHPUT_SUITES:
            # Higher is better: speedup = modified / baseline
            # If modified > baseline, speedup > 1 (faster)
            speedup = modified_val / baseline_val
        else:
            # Lower is better (time): speedup = baseline / modified
            # If modified < baseline, speedup > 1 (faster)
            if baseline_val < 0.001:  # Skip very fast benchmarks (noise)
                continue
            speedup = baseline_val / modified_val

        ratios.append(speedup)
        details.append({
            'suite': suite,
            'benchmark': key[1],
            'baseline_value': round(baseline_val, 4),
            'modified_value': round(modified_val, 4),
            'speedup': round(speedup, 4)
        })

    if not ratios:
        print("WARNING: No matching benchmark results")
        return 1.0, 0, []

    # Geometric mean of speedup ratios
    log_sum = sum(math.log(r) for r in ratios)
    geomean = math.exp(log_sum / len(ratios))

    return geomean, len(ratios), details

def write_atomic(path, payload):
    """Write `payload` to `path` atomically (tempfile + os.replace).

    A torn/partial reward file (e.g. on crash) would otherwise be read by
    Harbor as a malformed reward. os.replace() is atomic on POSIX, so the
    reader sees either the old file or the complete new one — never a mix.
    """
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


def write_reward(output_dir, reward, subscores, additional_data):
    """Write reward.json (canonical schema) and reward.txt (single float).

    Schema: top-level score/reward/subscores; every task-specific metric lives
    under additional_data (no splatted keys). Both files are written atomically.
    """
    os.makedirs(output_dir, exist_ok=True)
    reward = round(max(0.0, min(1.0, float(reward))), 6)
    reward_data = {
        "score": reward,
        "reward": reward,
        "subscores": subscores,
        "additional_data": additional_data,
    }
    write_atomic(os.path.join(output_dir, 'reward.json'),
                 json.dumps(reward_data, indent=2) + "\n")
    write_atomic(os.path.join(output_dir, 'reward.txt'), str(reward))
    return reward_data


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description='Compute PCC optimization reward (baseline vs modified)')
    parser.add_argument('--fail',
                        help='Hard failure reason (writes score=0 and returns)')
    parser.add_argument('--baseline-csv',
                        help='Baseline PCC benchmark results CSV')
    parser.add_argument('--modified-csv',
                        help='Modified PCC benchmark results CSV')
    parser.add_argument('--baseline-correctness-csv',
                        help='Baseline correctness test results CSV')
    parser.add_argument('--modified-correctness-csv',
                        help='Modified correctness test results CSV')
    parser.add_argument('--output-dir', required=True,
                        help='Directory to write reward.json')
    parser.add_argument('--noise-floor', type=float, default=1.05,
                        help='Speedup at/below which the gain is treated as '
                             'measurement noise (reward 0). Derived from '
                             'baseline timing variance by test.sh.')
    parser.add_argument('--coremark-validated', type=int, default=1,
                        help='1 if the modified CoreMark printed a valid '
                             'self-CRC ("Correct operation validated"); 0 if '
                             'not. 0 forces reward 0 (output-validation gate).')
    parser.add_argument('--crc-match', type=int, default=1,
                        help='1 if the modified CoreMark CRCs byte-match the '
                             'baseline (golden) CRCs; 0 forces reward 0.')
    parser.add_argument('--oracle', action='store_true',
                        help='Mark this as an oracle run (recorded in '
                             'additional_data; does not change scoring).')
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    # Hard-failure short-circuit: write a zeroed reward (reason in additional_data)
    # and return. Used by test.sh for anti-cheat hits and build/test failures.
    if args.fail:
        write_reward(
            args.output_dir, 0.0,
            subscores=[
                {"subtask": "speedup", "score": 0.0, "stdout": "", "stderr": ""},
                {"subtask": "correctness", "score": 0.0, "stdout": "", "stderr": ""},
            ],
            additional_data={"status": "failed", "reason": args.fail,
                             "is_oracle": bool(args.oracle)},
        )
        print(f"FAIL: {args.fail} -> reward 0.0")
        return 0

    # Load results
    baseline_benchmarks = load_benchmark_csv(args.baseline_csv)
    modified_benchmarks = load_benchmark_csv(args.modified_csv)
    baseline_correctness = load_correctness_csv(args.baseline_correctness_csv)
    modified_correctness = load_correctness_csv(args.modified_correctness_csv)

    # Compute correctness
    correctness_gated, baseline_pass, baseline_fail, modified_pass, modified_fail, \
        regressions, fixes = compute_correctness_score(
            baseline_correctness, modified_correctness)

    # Compute performance
    speedup_ratio, num_benchmarks, perf_details = \
        compute_performance_score(baseline_benchmarks, modified_benchmarks)

    # OUTPUT-VALIDATION GATE (Phase 2): a fast-but-miscompiled CoreMark must
    # not score. The modified CoreMark self-validates via CRC ("Correct
    # operation validated") and its CRCs must byte-match the baseline (golden).
    # test.sh hard-gates this too; this is the defense-in-depth Python copy.
    validation_failed = (args.coremark_validated != 1) or (args.crc_match != 1)

    # Noise floor: any "speedup" at or below this is measurement noise. The
    # floor is the larger of the calibrated 1.05 step and the variance-derived
    # floor passed by test.sh (baseline stdev/median).
    noise_floor = max(1.05, float(args.noise_floor))

    # Compute reward with discrete steps (measurement noise protection)
    if validation_failed:
        reward = 0.0
        print("OUTPUT-VALIDATION GATE FAILED: modified CoreMark did not "
              f"self-validate (validated={args.coremark_validated}, "
              f"crc_match={args.crc_match}) -> reward 0.0")
    elif correctness_gated:
        reward = 0.0
        print(f"CORRECTNESS GATE FAILED: {len(regressions)} regression(s)")
        for t in regressions:
            print(f"  - {t}")
    else:
        # Discrete reward steps calibrated against GCC -O3 ceiling.
        # PCC -O baseline scores ~9054 iter/s on CoreMark vs GCC -O3 ~23438.
        # GCC parity would require ~2.59x speedup, so the scale is:
        # - Ignore noise below 5% improvement
        # - Finer granularity in the achievable 1.0x-2.0x range
        # - Reward 1.0 at ~GCC parity (~2.59x)

        if speedup_ratio <= noise_floor:
            reward = 0.0
            threshold = f"<= {noise_floor:.3f}x (noise floor)"
        elif speedup_ratio < 1.10:
            reward = 0.1
            threshold = "1.05x - 1.10x (5-10%)"
        elif speedup_ratio < 1.20:
            reward = 0.2
            threshold = "1.10x - 1.20x (10-20%)"
        elif speedup_ratio < 1.30:
            reward = 0.3
            threshold = "1.20x - 1.30x (20-30%)"
        elif speedup_ratio < 1.50:
            reward = 0.4
            threshold = "1.30x - 1.50x (30-50%)"
        elif speedup_ratio < 1.75:
            reward = 0.5
            threshold = "1.50x - 1.75x (50-75%)"
        elif speedup_ratio < 2.0:
            reward = 0.6
            threshold = "1.75x - 2.0x (75-100%)"
        elif speedup_ratio < 2.25:
            reward = 0.7
            threshold = "2.0x - 2.25x (100-125%)"
        elif speedup_ratio < 2.50:
            reward = 0.8
            threshold = "2.25x - 2.50x (125-150%)"
        elif speedup_ratio < 2.59:
            reward = 0.9
            threshold = "2.50x - 2.59x (150% - near GCC parity)"
        else:
            reward = 1.0
            threshold = "≥ 2.59x (at or above GCC -O3 speed)"

        if reward == 0.0:
            print(f"NO SIGNIFICANT IMPROVEMENT: speedup={speedup_ratio:.4f}x {threshold}")
        else:
            print(f"IMPROVEMENT DETECTED: speedup={speedup_ratio:.4f}x {threshold} → reward={reward:.1f}")

    # Build reward JSON (all task-specific metrics nested in additional_data).
    num_regressions = len(regressions)
    subscores = [
        {
            "subtask": "speedup",
            "score": round(speedup_ratio, 4),
            "stdout": f"speedup={speedup_ratio:.2f}x",
            "stderr": "",
        },
        {
            "subtask": "correctness",
            "score": 1.0 if (not correctness_gated and not validation_failed) else 0.0,
            "stdout": f"regressions={num_regressions}",
            "stderr": "validation_gate_failed" if validation_failed else "",
        },
    ]
    additional_data = {
        "status": "ok",
        "speedup_ratio": round(speedup_ratio, 6),
        "baseline_pass": baseline_pass,
        "baseline_fail": baseline_fail,
        "modified_pass": modified_pass,
        "modified_fail": modified_fail,
        "num_regressions": num_regressions,
        "num_fixes": len(fixes),
        "num_benchmarks": num_benchmarks,
        "correctness_gated": correctness_gated,
        "coremark_validated": bool(args.coremark_validated),
        "crc_match": bool(args.crc_match),
        "validation_gate_failed": validation_failed,
        "noise_floor": round(noise_floor, 6),
        "is_oracle": bool(args.oracle),
    }

    write_reward(args.output_dir, reward, subscores, additional_data)
    reward_path = os.path.join(args.output_dir, 'reward.json')

    # Write detailed results
    details_data = {
        "reward": round(reward, 6),
        "speedup_ratio": round(speedup_ratio, 6),
        "baseline_pass": baseline_pass,
        "baseline_fail": baseline_fail,
        "modified_pass": modified_pass,
        "modified_fail": modified_fail,
        "regressions": regressions,
        "fixes": fixes,
        "num_benchmarks": num_benchmarks,
        "correctness_gated": correctness_gated,
        "performance_details": perf_details,
    }
    details_path = os.path.join(args.output_dir, 'reward_details.json')
    with open(details_path, 'w') as f:
        json.dump(details_data, f, indent=2)

    # Print summary
    print("=" * 60)
    print("  PCC Optimization Reward Summary")
    print("  (PCC-Bootstrap Mode: Modified vs Baseline)")
    print("=" * 60)
    print(f"  Baseline:    {baseline_pass}/{baseline_pass+baseline_fail} passed")
    print(f"  Modified:    {modified_pass}/{modified_pass+modified_fail} passed")
    print(f"  Regressions: {len(regressions)}")
    if regressions:
        for t in regressions[:5]:
            print(f"    - {t}")
        if len(regressions) > 5:
            print(f"    ... and {len(regressions)-5} more")
    if fixes:
        print(f"  Fixes:       {len(fixes)}")
        for t in fixes[:5]:
            print(f"    + {t}")
        if len(fixes) > 5:
            print(f"    ... and {len(fixes)-5} more")
    print(f"  Speedup:     {speedup_ratio:.4f}x (modified vs baseline)")
    print(f"  Noise floor: {noise_floor:.4f}x")
    print(f"  Benchmarks:  {num_benchmarks}")
    print(f"  Validation:  {'PASSED' if not validation_failed else 'FAILED'} "
          f"(validated={bool(args.coremark_validated)}, crc_match={bool(args.crc_match)})")
    print(f"  Gate:        {'PASSED' if not correctness_gated else 'FAILED'}")
    print(f"  Reward:      {reward:.6f}")
    if reward > 0:
        print(f"    (discrete steps, GCC parity at ~2.59x = reward 1.0)")
    print(f"  Output:      {reward_path}")
    print("=" * 60)

    # Print performance breakdown
    if perf_details:
        perf_details.sort(key=lambda x: x['speedup'])
        print("\nPerformance breakdown (slowest first):")
        print(f"  {'Suite':<12} {'Benchmark':<20} {'Baseline':>10} "
              f"{'Modified':>10} {'Speedup':>8}")
        print(f"  {'-'*12} {'-'*20} {'-'*10} {'-'*10} {'-'*8}")
        for d in perf_details[:15]:
            print(f"  {d['suite']:<12} {d['benchmark']:<20} "
                  f"{d['baseline_value']:>10.4f} {d['modified_value']:>10.4f} "
                  f"{d['speedup']:>8.4f}x")
        if len(perf_details) > 15:
            print(f"  ... and {len(perf_details) - 15} more")

    # Always exit 0 on a successful scoring pass — a gated run (reward 0.0) is a
    # normal, fully-computed outcome, not a verifier crash. test.sh treats a
    # non-zero exit as compute_reward_crashed, so reserve it for real failures.
    return 0

if __name__ == '__main__':
    sys.exit(main())
