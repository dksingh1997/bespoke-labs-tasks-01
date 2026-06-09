# QA Report: pcc-optimize-coremark__jpDkU39

## Verdict: FAIR

**Confidence**: 0.9
**Reward**: 0.0

## Timing

**Agent execution**: ~5698s / 94m 58s (12:22:03 → 13:57:01)
**Verifier**: ~584s / 9m 44s (13:57:18 → 14:07:02)
**Agent setup**: ~28s
**Timed out**: no (agent voluntarily marked `task_complete` with ~22 min of its 120-min budget remaining)

## Agent Strategy

- **Approach**: Incremental, correctness-first compiler back-end optimization. The agent studied PCC's machine-independent optimizer (`optim.c`, `order.c`) and the amd64 instruction table (`table.c`), made small targeted code-generation improvements, rebuilt with the bootstrap compiler, and validated each change against the correctness suite and CoreMark CRCs.
- **Key steps**:
  1. Narrow-comparison optimization in `optim.c` — eliminate redundant integer promotions (`movzbl`/`movswl`) when comparing `(int)(char/short)x` against a constant.
  2. Chained-deref offset folding in `order.c` — canonicalize `PLUS(reg, const)` so `p->a->b` offsets fold into displacements (`8(%rax)`) instead of `movabsq`+indexed addressing.
  3. Immediate add/sub in `table.c` — enable `addq/subq $imm32, reg/mem` instead of `movabsq $c; addq`.
  4. Rebuilt pcc + pcc-libs, ran the full 916-test correctness suite and official CoreMark benchmark, confirmed CRCs bit-identical to reference.
- **Iterations**: 173 episodes / ~94 min of edit-build-test cycles. The agent reported trying and reverting more aggressive changes (address hoisting, unsigned narrowing) after they caused regressions — i.e. it adapted rather than looping on a failing approach.
- **Time allocation**: Substantial reading/analysis of PCC internals up front, then a long sequence of small edits each followed by a rebuild (PCC rebuilds are slow) and a benchmark/correctness check.
- **What worked / failed**: All three optimizations were correctness-preserving (0 regressions, CRC match, +4 previously-failing tests now passing). The failure point is purely magnitude: the verifier measured only 1.0411x (13961.6 vs 13410.2 iter/s), just under the 1.05x noise floor.
- **Strategy quality**: Sound and disciplined. The agent correctly prioritized correctness (the hard gate), chose plausible peephole/codegen wins for a hot state-machine benchmark, validated rigorously, and stopped early rather than risk a last-minute regression. The shortfall is that PCC's `-O` back-end is far behind GCC -O3, and the agent's hand-written peephole tweaks were not enough to clear even the 5% bar — a reasonable but ultimately insufficient outcome, not a strategic error.

## Flags

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The agent produced a genuine, validated improvement — `reward_details.json` shows `baseline_value: 13410.2186`, `modified_value: 13961.6056`, `speedup: 1.0411`, with `num_regressions: 0` and `crc_match: true`. Because `compute_reward.py` uses discrete steps starting at the `1.05x` noise floor (`if speedup_ratio <= noise_floor: reward = 0.0`), a real ~4.1% gain receives exactly the same 0.0 as the sibling trial's 0.997x (no improvement at all). The noise floor was clamped to the 1.05 minimum (`baseline median=13410.2 stdev=5.5779`, variance-derived floor ≈1.001), so the threshold is a fixed design constant, not data-driven here.
**Recommendation**: This is a documented, defensible design choice (noise-floor protection + GCC-calibrated steps), not unfairness. If finer signal is desired, consider a continuous/partial reward between the measured noise floor and the first step so that a verified, regression-free 4% gain is distinguishable from zero improvement. Not required for fairness.

## Summary

The trial completed cleanly end-to-end with a correctly-computed reward of 0.0. The verifier is well-hardened and behaved exactly as designed: it ran the agent's compiler and the emitted CoreMark binary as the unprivileged `agent` user under `strace -f`, locked and wiped `/logs/verifier`, re-locked `/tests`, sanitized the environment, established golden CRCs from a root-built pristine baseline, and gated on CoreMark self-CRC match. The strace scan found **zero** reward-file writes (`grep` for write-mode `openat` on `reward.{txt,json}` returned 0), and there is no evidence of any reward hacking, file planting, or tampering.

The agent did legitimate, high-quality work: three correctness-preserving back-end optimizations, 0 regressions across 916 tests, bit-identical CoreMark CRCs, and a real ~4.1% throughput gain (verifier-measured 1.0411x). It fell just short of the 1.05x meaningful-improvement threshold required for the first reward step (0.1). The instruction told the agent to "improve PCC's generated code speed as much as possible" with no promised threshold; a noise-floor that discards sub-5% gains is a reasonable measurement-noise guard, and the oracle (gcc-12 -O3 delegation) confirms the reward ceiling is achievable. This is a hard-but-fair task: the 0.0 reward accurately reflects that the agent's improvement, while genuine, did not reach the benchmark's significance bar. The only note is a low-severity observation that the discrete scoring discards the difference between a verified 4% gain and zero gain — a design preference, not a fairness defect.
