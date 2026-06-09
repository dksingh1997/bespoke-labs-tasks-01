# QA Report: ts-type-checker__6TTeHuT

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s — from result.json (agent_execution started 12:47:12, finished 14:47:12)
**Verifier**: ~12s — from result.json (verifier started 14:47:43, finished 14:47:55)
**Agent setup**: ~28s — from result.json (agent_setup 12:46:43 → 12:47:12)
**Timed out**: yes (AgentTimeoutError after exactly 7200.0s — the full task budget)

## Agent Strategy

- **Approach**: Incremental, breadth-first extension of the starter checker. The agent built its own eval harness (`/app/eval.py`, `/tmp/fpfind.py`, `/tmp/only.py`), then added one TS error code at a time while continuously measuring pass-count and false-positive (FP) regressions, snapshotting working versions (`tscheck.v7` ... `tscheck.v14`).
- **Key steps**: (1) Explored `/app`, starter checker, ~1,600 sample `.ts`/`.errors` pairs. (2) Built an eval harness measuring pass count and clean-file FPs. (3) Implemented TS2322, TS2345, TS2554, TS2339, TS2454, TS2430, TS2695, TS2352, TS2411 incrementally. (4) Spent significant effort suppressing false positives on the ~599 empty/clean files (a real constraint, since FPs fail clean files). (5) Final self-measured score ~726/1547 ≈ 47% on visible tests, 0 clean FPs.
- **Iterations**: 192 episodes of edit-measure-snapshot cycles. The agent did NOT get stuck in a loop — each cycle targeted a different error category or FP source and adapted based on measured deltas.
- **Time allocation**: Roughly even split between reading test corpora, implementing checks, and validating against the eval harness. Used the entire 2-hour budget productively.
- **What worked / failed**: Worked: disciplined regression-free incremental development with version snapshots and FP tracking. Failed: ran out of time and, critically, never made TS2339 detect property access on an `interface`-typed variable (`p.z` where `p: Point`). The agent was aware TS2339 was a canary requirement (24 episodes mention it) and got ~19 visible TS2339 files passing, but its implementation did not generalize to the canary's interface-property case.
- **Strategy quality**: Sound. Breadth-first matched the instruction's explicit guidance ("Prioritize breadth over depth"). The eval harness and FP discipline were exactly right for a precision-sensitive task. The agent adapted continuously rather than repeating a failing approach. The only misallocation was not specifically hardening the canary categories (the instruction warns the canary gate zeroes the whole score) — but this is a reasonable strategic miss, not poor process.

## Flags

(none)

## Summary

The agent attempted to build a TypeScript type checker by extending the provided starter, working through 192 episodes of disciplined, regression-aware incremental development and reaching ~47% on the visible test corpus with zero false positives on clean files. It exhausted the full 2-hour budget and was terminated by `AgentTimeoutError` at exactly 7200s. The verifier ran successfully afterward (~12s) against the checker present in `/app/checker/tscheck`.

The score of 0.0 is legitimate and correctly reflects the outcome. The instruction explicitly states: "Your checker must also pass a small set of basic canary tests... If it fails any canary test, the score is 0." The verifier enforced exactly this: the canary gate passed 6/7, failing only `canary_property_missing.ts`, where the expected `TS2339` on line 7 (`let val: number = p.z;`, property `z` missing on interface `Point`) was not reported by the agent's checker (`missed=[(7, 'TS2339')]`, no false positives). The instruction-verifier contract is consistent — no mismatch.

Anti-cheat is clean and the verifier is well-hardened: it locks+wipes `/logs/verifier` first, re-locks `/tests` to 0700, sanitizes env, runs the checker as the non-root `agent` user under `strace -f`, and applies execve (tsc/tsserver) and reward-file-write tripwires. The strace log shows 16 `execve` references to "tsc" but all are the agent's own `tscheck` binary; the anchored tripwire correctly matched 0 real-compiler invocations. No reward-file writes appear in the strace log, and `reward.txt`/`reward.json` agree (0.0). There is no evidence of reward hacking, test tampering, or setup-phase exploitation. The timeout is the agent's own (it used its full budget on a genuinely very-hard task); the verifier still completed normally, so this is not an infrastructure failure. Verdict: FAIR.
