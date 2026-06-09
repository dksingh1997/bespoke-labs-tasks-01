# QA Report: ts-type-checker__YyLE7LD

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 3777s / 62m 57s (from result.json timing.agent_execution)
**Verifier**: 0.75s (from result.json timing.verifier)
**Agent setup**: 20.8s (from result.json timing.agent_setup)
**Timed out**: no (agent declared task_complete after 113 episodes, using ~53% of 7200s budget)

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — read existing code, studied test file patterns, then iteratively added type-checking rules for TS2304, TS2322, TS2339, and TS2554 using python3 string-replace patches on the checker script.
- **Key steps**:
  1. Read the starter `tscheck` script and explored test files/lib definitions (episodes 0-10)
  2. Extended GLOBALS set and declaration handling to reduce TS2304 false positives (episodes 10-40)
  3. Added TS2322 (assignment type mismatch), TS2339 (property access), and TS2554 (wrong arg count) checks (episodes 40-80)
  4. Added function parameter handling, class method parameter scope, and TSDeclareFunction support (episodes 70-100)
  5. Declared complete at 355/1547 (22.9%) pass rate on visible tests (episodes 110-112)
- **Iterations**: ~113 episodes with ~10 substantive edit-test cycles. Used python3 heredocs for string replacement edits on the checker file. Many episodes were small diagnostic or debugging commands.
- **Time allocation**: ~15% reading/exploration, ~60% editing and debugging, ~25% running tests and evaluating progress. The agent used only ~53% of the available 2-hour budget.
- **What worked / failed**: The agent successfully extended the starter checker for basic TS2304, TS2322, TS2339, and TS2554. However, it critically failed to implement return-type checking (TS2322 for return statements) — `canary_return_type.ts` expected errors on lines 2 and 6 but the checker produced nothing. It also introduced a false positive on `canary_property_missing.ts` line 6 where it incorrectly flagged `{ x: 1, y: 2 }` as not assignable to `Point` (the agent's output shows a TS2322 error on line 6 that shouldn't exist).
- **Strategy quality**: The incremental approach was reasonable, but the agent left significant time unused (stopped at ~63 min with ~57 min remaining). The agent was aware that canary tests were critical (mentioned in episode 85) but did not specifically test against canary-like scenarios (return type mismatches) that the instructions explicitly describe. A 22.9% pass rate after 63 minutes is modest. The agent could have used remaining time to fix the return-type gap and the object literal false positive.

## Flags

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The agent passed 5/7 canary tests and achieved 355/1547 (22.9%) on visible tests. The canary gate is all-or-nothing: 100% required to qualify for hidden test scoring. The two canary failures were: a false positive on one line (`canary_property_missing.ts` line 6) and missing return-type checking (`canary_return_type.ts` lines 2, 6). The agent's partial work on 4 error categories goes entirely unscored.
**Recommendation**: The canary gate design is legitimate and clearly documented in the instructions ("If it fails any canary test, the score is 0"). The canary tests cover fundamental capabilities. For benchmarking diagnostics, recording what the hidden test score would have been (even with final reward = 0) would provide useful signal. This is not an unfairness issue, just a suggestion for richer data collection.

## Summary

The agent (terminus-2 / z-ai/glm-5) attempted the TypeScript type checker task by incrementally extending the starter checker. It implemented checks for 4 error types (TS2304, TS2322, TS2339, TS2554) and achieved 22.9% on visible tests. The verifier scored it 0.0 because it failed the canary gate (5/7 instead of the required 7/7). The two canary failures were: (1) a false positive on `canary_property_missing.ts` line 6 where the checker incorrectly flagged a valid `{x:1, y:2}` assignment to an interface type, and (2) a complete miss on `canary_return_type.ts` where the checker did not detect return-type mismatches — a fundamental type-checking capability explicitly listed in the instructions as a canary test topic.

The scoring is fair. The canary tests are reasonable, clearly documented in the instructions, and test exactly the fundamental capabilities described. No infrastructure failures occurred (verifier ran in <1s, anti-cheat passed, no exceptions). No reward hacking or test tampering was detected. The agent had ample time and resources but chose to stop early. The failure is attributable to incomplete implementation of return-type checking and a buggy object-literal type comparison.
