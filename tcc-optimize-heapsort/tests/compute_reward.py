#!/usr/bin/env python3
"""Compute reward score for TCC optimization task (TCC-Bootstrap Mode).

Compares modified TCC vs baseline TCC (NOT vs GCC). This module runs OUTSIDE
strace, as root, after every agent-spawned process is dead. It never imports or
executes agent code: it only reads CSV/text files and byte-compares the heapsort
stdout against a root-computed golden. Invoke it with `python3 -ISs` so the
runtime ignores PYTHON* env, user site-packages, and the site module.

Reward = correctness_gate AND output_gate, scaled by heapsort speedup:

  - Correctness gate (HARD): any test the baseline PASSes but the modified TCC
    does not PASS (FAIL/COMPILE_FAIL/TIMEOUT/SKIP/missing) is a regression.
    A regression -> reward 0. Missing-in-modified counts as a regression so the
    agent cannot hide a regression by deleting rows from the modified CSV.
  - Output gate (HARD, Phase 2.3): the modified compiler's heapsort binary
    stdout must byte-match the golden produced by the baseline compiler. A
    mismatch / missing / symlinked output -> that benchmark contributes 0
    (no speedup credit). This blocks "miscompile heapsort to be fast".
  - Speedup (Phase 2.4): interleaved baseline-vs-modified timing samples; the
    score is the median of per-iteration baseline/modified ratios (interleaving
    cancels machine drift). The noise floor is the larger of 1.05x and a band
    derived from the baseline's measured variance, then linear scaling to full
    reward at 1.40x, clamped to [0, 1].
"""

import argparse
import csv
import json
import math
import os
import statistics
import sys
import tempfile

# --- Reward shaping constants (KEEP: NOISE_FLOOR / FULL_REWARD clamp) ---
NOISE_FLOOR = 1.05          # hard minimum noise floor (timing jitter)
FULL_REWARD_SPEEDUP = 1.40  # linear scaling reaches full reward here
NOISE_SIGMA = 2.0           # baseline-variance band: floor >= 1 + SIGMA*cv


# ----------------------------------------------------------------------------
# Atomic output (Phase 4): never leave a half-written reward.{json,txt}.
# ----------------------------------------------------------------------------
def write_atomic(path, payload):
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


def emit_reward(output_dir, score, subscores, additional_data):
    """Write reward.json (Harbor schema) and reward.txt atomically.

    Schema: top-level `score`/`reward`/`subscores`; all task-specific metrics
    live under `additional_data` (no splatted keys).
    """
    os.makedirs(output_dir, exist_ok=True)
    score = round(max(0.0, min(1.0, float(score))), 6)
    reward_data = {
        "score": score,
        "reward": score,
        "subscores": subscores,
        "additional_data": additional_data,
    }
    write_atomic(os.path.join(output_dir, "reward.json"),
                 json.dumps(reward_data, indent=2))
    write_atomic(os.path.join(output_dir, "reward.txt"), str(score))
    return reward_data


# ----------------------------------------------------------------------------
# CSV loaders
# ----------------------------------------------------------------------------
def load_correctness_csv(path):
    results = {}
    if not path or not os.path.exists(path):
        print(f"WARNING: Correctness CSV not found: {path}")
        return results
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            test = row.get("test")
            if test is not None:
                results[test] = row.get("result", "")
    return results


def load_timing_csv(path):
    """Load interleaved timing samples: rows of iter,baseline_sec,modified_sec."""
    baseline, modified = [], []
    if not path or not os.path.exists(path):
        print(f"WARNING: Timing CSV not found: {path}")
        return baseline, modified
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            try:
                b = float(row["baseline_sec"])
                m = float(row["modified_sec"])
            except (KeyError, ValueError, TypeError):
                continue
            if b > 0 and m > 0:
                baseline.append(b)
                modified.append(m)
    return baseline, modified


# ----------------------------------------------------------------------------
# Gates
# ----------------------------------------------------------------------------
def compute_correctness_gate(baseline_results, modified_results):
    """Regression = baseline PASS and modified != PASS (incl. missing).

    Returns (gated, baseline_pass, baseline_fail, modified_pass, modified_fail,
             regressions, fixes).
    """
    baseline_pass = sum(1 for r in baseline_results.values() if r == "PASS")
    baseline_fail = sum(1 for r in baseline_results.values()
                        if r in ("FAIL", "COMPILE_FAIL"))
    modified_pass = sum(1 for r in modified_results.values() if r == "PASS")
    modified_fail = sum(1 for r in modified_results.values()
                        if r in ("FAIL", "COMPILE_FAIL"))

    regressions = []
    for test, b in baseline_results.items():
        if b != "PASS":
            continue
        m = modified_results.get(test, "")  # missing -> "" -> regression
        if m != "PASS":
            regressions.append(test)

    fixes = []
    for test, b in baseline_results.items():
        if b in ("FAIL", "COMPILE_FAIL") and modified_results.get(test) == "PASS":
            fixes.append(test)

    gated = len(regressions) > 0
    return (gated, baseline_pass, baseline_fail, modified_pass, modified_fail,
            sorted(regressions), sorted(fixes))


def check_output_gate(golden_path, modified_path):
    """Byte-compare modified heapsort stdout against the golden (Phase 2.3).

    Returns (passed, reason). Reading bytes is safe (no agent code executes);
    a symlinked modified output is rejected so a root read cannot be redirected
    into a root-only file.
    """
    if not golden_path or not os.path.exists(golden_path):
        return False, "golden_missing"
    if not modified_path or not os.path.exists(modified_path):
        return False, "modified_output_missing"
    if os.path.islink(modified_path):
        return False, "modified_output_symlink"
    try:
        with open(golden_path, "rb") as f:
            golden = f.read()
        with open(modified_path, "rb") as f:
            modified = f.read()
    except OSError as e:
        return False, f"output_read_error:{e}"
    if not golden.strip():
        return False, "golden_empty"
    if golden != modified:
        return False, "output_mismatch"
    return True, "match"


# ----------------------------------------------------------------------------
# Speedup (Phase 2.4)
# ----------------------------------------------------------------------------
def compute_speedup(baseline_samples, modified_samples):
    """Median of interleaved per-iteration ratios + baseline-derived noise floor.

    Returns (speedup, noise_floor, details).
    """
    details = {
        "num_samples": min(len(baseline_samples), len(modified_samples)),
        "baseline_min": round(min(baseline_samples), 6) if baseline_samples else None,
        "modified_min": round(min(modified_samples), 6) if modified_samples else None,
    }
    if not baseline_samples or not modified_samples:
        return 0.0, NOISE_FLOOR, details

    ratios = [b / m for b, m in zip(baseline_samples, modified_samples) if m > 0]
    if not ratios:
        return 0.0, NOISE_FLOOR, details

    speedup_median = statistics.median(ratios)
    speedup_min = min(baseline_samples) / min(modified_samples)

    # Noise floor from baseline variance: require the speedup to clear the
    # baseline's own jitter band, but never go below the hard 1.05x floor.
    if len(baseline_samples) >= 2:
        mean_b = statistics.mean(baseline_samples)
        cv = (statistics.pstdev(baseline_samples) / mean_b) if mean_b > 0 else 0.0
    else:
        cv = 0.0
    noise_floor = max(NOISE_FLOOR, 1.0 + NOISE_SIGMA * cv)

    details.update({
        "speedup_median_ratio": round(speedup_median, 6),
        "speedup_min_ratio": round(speedup_min, 6),
        "baseline_cv": round(cv, 6),
        "noise_floor": round(noise_floor, 6),
    })
    return speedup_median, noise_floor, details


def scale_reward(speedup, noise_floor):
    """KEEP: noise-floor cutoff + linear ramp to full reward, clamped [0,1]."""
    effective_full = max(FULL_REWARD_SPEEDUP, noise_floor + 0.05)
    if speedup <= noise_floor:
        return 0.0
    return max(0.0, min(1.0, (speedup - noise_floor) / (effective_full - noise_floor)))


# ----------------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Compute TCC optimization reward (baseline vs modified)")
    parser.add_argument("--baseline-correctness-csv")
    parser.add_argument("--modified-correctness-csv")
    parser.add_argument("--timing-csv",
                        help="Interleaved timing CSV: iter,baseline_sec,modified_sec")
    parser.add_argument("--golden-output",
                        help="Baseline-compiled heapsort stdout (root-only golden)")
    parser.add_argument("--modified-output",
                        help="Modified-compiled heapsort stdout (output gate)")
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--oracle", action="store_true",
                        help="Oracle run (token-verified by test.sh): disable the "
                             "correctness-regression gate. The gcc-delegation oracle "
                             "legitimately diverges from baseline tcc on UB-heavy "
                             "torture tests; this flag is only passed when test.sh "
                             "matched the unforgeable oracle token, so a normal agent "
                             "can never reach it. Output gate + speedup stay enforced.")
    parser.add_argument("--fail", help="Hard-failure reason: write 0.0 and exit")
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    # Hard-failure path (build/setup error, anti-cheat hit). No inputs needed.
    if args.fail:
        emit_reward(
            args.output_dir,
            score=0.0,
            subscores=[
                {"subtask": "speedup", "score": 0.0, "stdout": "", "stderr": args.fail},
                {"subtask": "correctness", "score": 0.0, "stdout": "", "stderr": args.fail},
                {"subtask": "output_validation", "score": 0.0, "stdout": "", "stderr": args.fail},
            ],
            additional_data={"error": args.fail},
        )
        print(f"FAIL: {args.fail}")
        return 0

    # --- Correctness gate ---
    baseline_correctness = load_correctness_csv(args.baseline_correctness_csv)
    modified_correctness = load_correctness_csv(args.modified_correctness_csv)
    (correctness_gated, baseline_pass, baseline_fail, modified_pass,
     modified_fail, regressions, fixes) = compute_correctness_gate(
        baseline_correctness, modified_correctness)

    # --- Oracle exemption (token-verified upstream by test.sh) ---
    # The gcc-delegation oracle's gcc -O3 legitimately differs from the baseline
    # tcc on a handful of UB-heavy gcc-torture tests, so the regression gate would
    # otherwise zero its reward. This bypass is reached ONLY when test.sh matched
    # the unforgeable [solution.env] oracle token, so it cannot help a real agent.
    # Every other gate (output-validation vs golden, speedup/noise floor) stays on.
    correctness_gate_bypassed = False
    if args.oracle and correctness_gated:
        correctness_gate_bypassed = True
        correctness_gated = False
        print(f"ORACLE: correctness-regression gate disabled "
              f"({len(regressions)} regression(s) vs baseline tcc ignored).")

    # --- Output gate (Phase 2.3) ---
    output_passed, output_reason = check_output_gate(
        args.golden_output, args.modified_output)

    # --- Speedup (Phase 2.4) ---
    baseline_samples, modified_samples = load_timing_csv(args.timing_csv)
    speedup, noise_floor, speedup_details = compute_speedup(
        baseline_samples, modified_samples)

    # --- Combine gates ---
    if correctness_gated:
        reward = 0.0
        print(f"CORRECTNESS GATE FAILED: {len(regressions)} regression(s)")
        for t in regressions[:10]:
            print(f"  - {t}")
    elif not output_passed:
        reward = 0.0
        print(f"OUTPUT GATE FAILED: heapsort stdout {output_reason} "
              f"(speedup={speedup:.4f}x ignored — no credit for a miscompile)")
    else:
        reward = scale_reward(speedup, noise_floor)
        if reward == 0.0:
            print(f"NO SIGNIFICANT IMPROVEMENT: speedup={speedup:.4f}x "
                  f"<= noise floor {noise_floor:.4f}x")
        else:
            print(f"IMPROVEMENT DETECTED: speedup={speedup:.4f}x "
                  f"(noise floor {noise_floor:.4f}x) -> reward={reward:.3f}")

    num_regressions = len(regressions)
    additional_data = {
        "speedup": round(speedup, 6),
        "noise_floor": round(noise_floor, 6),
        "is_oracle": bool(args.oracle),
        "correctness_gate_bypassed": correctness_gate_bypassed,
        "correctness_gated": correctness_gated,
        "output_gated": (not output_passed),
        "output_gate_reason": output_reason,
        "baseline_pass": baseline_pass,
        "baseline_fail": baseline_fail,
        "modified_pass": modified_pass,
        "modified_fail": modified_fail,
        "num_regressions": num_regressions,
        "num_fixes": len(fixes),
        "regressions": regressions[:50],
        "fixes": fixes[:50],
        "timing": speedup_details,
    }

    emit_reward(
        args.output_dir,
        score=reward,
        subscores=[
            {
                "subtask": "speedup",
                "score": round(speedup, 4),
                "stdout": f"speedup={speedup:.2f}x (floor {noise_floor:.2f}x)",
                "stderr": "",
            },
            {
                "subtask": "correctness",
                "score": 1.0 if not correctness_gated else 0.0,
                "stdout": f"regressions={num_regressions}",
                "stderr": "",
            },
            {
                "subtask": "output_validation",
                "score": 1.0 if output_passed else 0.0,
                "stdout": f"heapsort_output={output_reason}",
                "stderr": "" if output_passed else output_reason,
            },
        ],
        additional_data=additional_data,
    )

    # Detailed sidecar (best-effort; not part of the reward contract).
    try:
        details_path = os.path.join(args.output_dir, "reward_details.json")
        write_atomic(details_path, json.dumps({
            "reward": round(reward, 6),
            **additional_data,
        }, indent=2))
    except OSError:
        pass

    # Summary
    print("=" * 60)
    print("  TCC Optimization Reward Summary (Modified vs Baseline)")
    print("=" * 60)
    print(f"  Baseline:    {baseline_pass}/{baseline_pass + baseline_fail} passed")
    print(f"  Modified:    {modified_pass}/{modified_pass + modified_fail} passed")
    print(f"  Regressions: {num_regressions}")
    print(f"  Correctness: {'PASSED' if not correctness_gated else 'FAILED'}")
    print(f"  Output gate: {'PASSED' if output_passed else 'FAILED (' + output_reason + ')'}")
    print(f"  Speedup:     {speedup:.4f}x  (noise floor {noise_floor:.4f}x)")
    print(f"  Reward:      {reward:.6f}")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
