# QA Report: ts-type-checker__qDvqxSk

## Verdict: FAIR

**Confidence**: 0.93
**Reward**: 0.492806

## Timing

**Agent execution**: 7200.0s / 120m 0s (from result.json timing.agent_execution)
**Verifier**: 5.6s (from result.json timing.verifier)
**Agent setup**: 21.7s (from result.json timing.agent_setup)
**Timed out**: yes (AgentTimeoutError after 7200s)

## Agent Strategy

- **Approach**: Incremental extension of starter checker with iterative FP/FN analysis — a data-driven tuning approach where the agent repeatedly ran the checker against visible tests, analyzed false positives and false negatives by error code, and adjusted check logic accordingly.
- **Key steps**:
  1. Read starter checker code and explored test file patterns/error distributions across TS error codes (episodes 0-5)
  2. Built comprehensive type checker extending the starter's TS2304 detection with TS2322 (type mismatch), TS2339 (property access), TS2454 (used before assigned), TS2554 (argument count), TS2564 (property initialization), TS7006 (implicit any), TS2362/2363 (arithmetic), and others (episodes 6-80)
  3. Iteratively tuned checks to reduce false positives — analyzed per-code FP rates, made checks more conservative where they generated more FPs than TPs (episodes 50-200)
  4. Continued micro-optimizations targeting specific failing test files in late episodes, tracking score from ~617 to ~724 to ~741 on visible tests (episodes 200-272)
  5. Hit the 2-hour timeout while still optimizing
- **Iterations**: 273 episodes — extremely high iteration count with continuous edit-test cycles. The agent ran the checker against visible tests dozens of times, comparing output against `.errors` files using custom Python evaluation scripts.
- **Time allocation**: ~5% reading/exploration, ~30% writing checker code, ~65% testing and analyzing results. The agent spent the majority of time on the testing/tuning loop.
- **What worked / failed**: The incremental, data-driven approach worked well — the agent achieved ~49% on hidden tests, which is substantial for building a type checker from scratch using only Babel AST. The agent successfully passed all 7 canary tests. The main limitation was the inherent difficulty of the task: a full TypeScript type checker requires handling classes, generics, control flow analysis, private names, overloads, and many other complex features. The weakest categories (conformance/classes at 33%, conformance/expressions at 36%) reflect the hardest parts of TypeScript type checking.
- **Strategy quality**: Good. The agent chose a sound incremental approach, prioritized breadth over depth (as the instructions suggested), and used systematic FP/FN analysis to guide improvements. It avoided getting stuck in unproductive loops — each iteration showed measured gains. The agent's decision to make some checks conservative (accepting some missed true positives) to avoid false positives was strategically sound given the per-file exact-match scoring. The timeout was expected given the 2-hour limit on what is labeled a "very_hard" task.

## Flags

No issues found.

## Summary

This trial ran cleanly and produced a fair result. The agent (terminus-2 / claude-opus-4-6) worked on a "very_hard" task — building a TypeScript type checker from scratch — for the full 2-hour timeout, achieving a score of 0.492806 (685/1390 hidden tests passed). The agent passed all 7 canary tests, passed anti-cheat checks, and no reward hacking was attempted (grep of all 273 episode responses found zero references to reward files, verifier paths, or hidden test infrastructure).

The verifier ran successfully in ~5.6 seconds with proportional scoring (hidden_passed / hidden_total), which is well-designed for this kind of task. The hidden tests cover the same categories as the visible tests (TypeScript compiler and conformance test patterns), so there is no hidden_test_asymmetry. The task instructions accurately describe the evaluation criteria, and the verifier enforces exactly what was described.

The agent timed out (AgentTimeoutError), but this is a natural consequence of the task difficulty, not an infrastructure failure — the agent was still actively optimizing when time expired. The verifier was still able to run after the timeout and produce a valid score.
