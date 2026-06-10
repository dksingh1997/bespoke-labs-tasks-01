# QA Report: ts-type-checker__Cmn8La7

## Verdict: FAIR

**Confidence**: 0.92
**Reward**: 0.0

## Timing

**Agent execution**: 2365.2s / 39m 25s (of 7200s allowed — used 32.8%)
**Verifier**: 0.7s
**Agent setup**: 21.8s
**Timed out**: no

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — read the existing codebase, analyzed test error frequencies, then rewrote the checker script with a basic type system supporting TS2304, TS2322, TS2339, TS2554, and TS2345.
- **Key steps**:
  1. Read the starter `tscheck` script and understood its architecture (episodes 0-1)
  2. Analyzed `.errors` files to count error code frequencies and prioritize which checks to implement (episode 2)
  3. Studied specific test files with TS2322 errors to understand expected patterns (episodes 3-5)
  4. Rewrote `/app/checker/tscheck` with a new implementation including type parsing, assignability checking, property access, and call checking (episode 6, then again in episode 11)
  5. Spent significant time debugging why the checker produced no output — fixing truncated file writes, missing `checkTypes`/`checkFile`/`main` code (episodes 7-18)
  6. Iteratively patched `isAssignable`, `getPropertyType`, and `checkCall` functions via Python replace scripts (episodes 19-30)
  7. Declared task complete at episode 31-32 without testing against canary-style scenarios (clean file with tuples, simple interface property access)
- **Iterations**: ~15+ edit-test cycles across 33 episodes. Much of the time was spent fighting implementation mechanics (truncated writes, missing functions) rather than expanding type-checking coverage.
- **Time allocation**: ~5 min reading, ~30 min writing and debugging the checker, ~5 min testing on sample files. The agent used only 32.8% of its 2-hour budget and submitted prematurely with ~80 minutes remaining.
- **What worked / failed**: The agent successfully implemented basic TS2304 (undefined names), TS2322 (type mismatch in assignments/returns), TS2554 (argument count), and TS2345 (argument type). It **failed** on two canary tests: (1) reported a false positive on `canary_clean_vars.ts` line 5 — `let pair: [string, number] = ["hello", 42]` was incorrectly flagged as a type error (tuple type assignability bug in `isAssignable`); (2) missed the TS2339 error on `canary_property_missing.ts` line 7 — `p.z` accesses a non-existent property on an interface with only `x` and `y` (interface property lookup not working correctly in `getPropertyType`).
- **Strategy quality**: The incremental approach was sound, but the agent made a critical mistake by declaring completion too early. With 80 minutes remaining, it had ample time to: (a) create canary-like test cases with clean valid code to check for false positives, (b) test simple interface property access scenarios, (c) run the checker on a broader set of sample tests. The agent only tested against a handful of sample files and never systematically validated basic scenarios. It also spent disproportionate time fighting file write mechanics rather than type-checking logic.

## Flags

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The agent passed 5/7 canary tests (71%) and implemented meaningful type-checking for multiple error codes (TS2304, TS2322, TS2554, TS2345). The canary gate is binary — 100% required or score is 0, meaning the agent's performance on 1,390 hidden tests was never measured. From `reward.json`: `"hidden_tests": {"passed": 0, "total": 0}` — hidden tests were never run.
**Recommendation**: The canary gate design is reasonable for ensuring minimum quality, and the instructions clearly state "If it fails any canary test, the score is 0." This is a legitimate design choice, not unfairness. The canary tests themselves are basic scenarios explicitly described in the instructions (type mismatches, undefined variables, property access, argument counts, clean files). However, providing hidden test results alongside the canary gate failure would give more discriminating signal for analysis purposes, even if the reward remains 0.

## Summary

This trial is **FAIR**. The agent (terminus-2 / gpt-5.2-codex) spent ~39 minutes of its 2-hour budget extending the starter TypeScript type checker to support multiple error codes. It achieved meaningful partial implementation covering TS2304, TS2322, TS2554, and TS2345, but its implementation had two critical bugs: a false positive on tuple type assignments (`[string, number] = ["hello", 42]` wrongly flagged) and a failure to detect property access errors on interface types (`p.z` on `Point{x,y}` not caught). These caused it to fail 2 of 7 canary tests, and the 100% canary gate requirement resulted in a score of 0.

The infrastructure operated correctly — no setup failures, no exceptions, no timeout, verifier completed in under 1 second. Anti-cheat checks passed; no evidence of reward hacking or test tampering was found in the agent trajectory. The canary tests are basic type-checking scenarios explicitly described in the instructions as fundamental capabilities. Both failures are implementation bugs in the agent's checker — tuple assignability logic and interface property resolution — not infrastructure or fairness issues. The agent submitted prematurely with 80 minutes remaining and never tested its checker against the specific failure scenarios (clean valid tuple code, simple interface property access), which would have been straightforward to catch.
