# QA Report: pcc-optimize-coremark__Y64LnyK

## Verdict: FAIR

**Confidence**: 0.97
**Reward**: 0.0

## Timing

**Agent execution**: ~6407s / 1h 47m (12:22:03 → 14:08:50)
**Verifier**: ~681s / 11m 21s (14:12:01 → 14:23:22)
**Agent setup**: ~28s
**Timed out**: no — the agent voluntarily set `task_complete: true` (~13 min before the 7200s limit)

## Agent Strategy

The task: edit PCC's source (`/app/compiler-src/pcc`), rebuild it with the bootstrap
compiler, and make the *generated code* faster (CoreMark) without breaking correctness.
Scoring is the modified compiler's CoreMark throughput vs. the pristine baseline,
gated on correctness + CRC validation, with a noise floor of 1.05x.

- **Approach**: Genuine compiler-backend hacking. Profiled PCC's amd64 output, identified
  that loops emit two control transfers per iteration (`Ltop: CBRANCH; body; GOTO Ltop`),
  and implemented a correctness-safe **loop-rotation pass** in `mip/optim2.c`.
- **Key steps**: (1) Profiled emitted assembly; (2) implemented loop rotation moving the
  test to the loop bottom, guarded by refcount==1 + not-exported; (3) hit and fixed a real
  bug around globally-unique label allocation (`crslab` stride); (4) restored correctness
  (48/49 quick suite, all failures expected, matches bootstrap); (5) **benchmarked rigorously**
  — baseline median ~13413 iter/s vs rotated build median ~13138, a consistent ~2% *regression*;
  (6) reverted `optim2.c` to byte-identical pristine baseline and shipped that.
- **Iterations**: 82 episodes. Single deeply-researched optimization, not a thrash loop.
- **Time allocation**: Roughly balanced — substantial profiling/analysis, a real
  implementation with a non-trivial bug fix, and multiple measured benchmark runs.
- **What worked / failed**: The engineering was competent (correct, well-reasoned, properly
  measured). It *failed the task's actual objective*: the chosen optimization did not help on
  this out-of-order x86 (back-edge branches are perfectly predicted), and no other landable
  win was found in time. The agent then made the conservative choice to ship the unmodified
  baseline rather than a regression or an unvalidated risky change.
- **Strategy quality**: Technically sound but ultimately unsuccessful. The agent correctly
  diagnosed that its only completed optimization was a net regression and correctly declined
  to ship it. However, shipping the *pristine baseline* guarantees a 0.0 score by the task's
  explicit design ("unmodified baseline scores 0.0"). A higher-EV play would have been to keep
  iterating on a different optimization class (it identified LICM/CSE/64-bit induction as
  candidates) rather than locking in a guaranteed-zero deliverable with ~18 min remaining.
  The risk-aversion was over-weighted: the downside of a *correct-but-neutral* experimental
  change is identical (0.0) to the baseline, so there was no real downside to continued
  experimentation as long as correctness held.

## Flags

(none)

## Summary

This is a clean, fair, fully-completed trial. The verifier executed end to end: it built the
pristine baseline as root, established golden CoreMark CRCs and a variance-derived noise floor
(1.05x), built the agent's modified PCC as the unprivileged `agent` user under `strace -f`,
scanned the strace log for reward-file tampering (zero hits), passed the correctness regression
gate (0 regressions) and the CoreMark self-CRC validation gate (crc_match=true), and computed
reward outside strace with no agent code in scope.

The measured speedup was **0.9975x** — i.e., the agent's shipped compiler is byte-identical to
the baseline (the agent explicitly reverted its only optimization after measuring a ~2%
regression). Per the task's stated design, an unmodified baseline scores exactly 0.0, and a
gain below the 1.05x noise floor maps to reward 0.0. The reward therefore accurately reflects
the agent's performance: it did genuine, correct compiler work but produced no measurable
speedup, which is a legitimate failure of the task's objective.

No infrastructure issues (modified build succeeded, verifier completed in 11m well under the
2400s timeout). No reward hacking — the trajectory shows no attempts to write reward files,
forge the oracle marker, install gcc/clang, or tamper with tests; strace confirms zero
reward-file writes. The anti-cheat hardening (non-root agent, `/tests` 0700, `/logs/verifier`
lock+wipe, strace auditing, env sanitization, CRC golden gate) is exemplary. Verdict: FAIR.
