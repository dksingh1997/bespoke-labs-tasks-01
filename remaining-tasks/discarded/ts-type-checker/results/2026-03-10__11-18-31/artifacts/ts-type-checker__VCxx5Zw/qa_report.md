# QA Report: ts-type-checker__VCxx5Zw

## Verdict: FAIR

**Confidence**: 0.93
**Reward**: 0.0

## Timing

**Agent execution**: 3306.8s / 55m 7s — from result.json timing.agent_execution (11:26:36 to 12:21:42)
**Verifier**: 0.9s — from result.json timing.verifier (12:21:42 to 12:21:43)
**Agent setup**: 22.2s — from result.json timing.agent_setup (11:26:13 to 11:26:36)
**Timed out**: no

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — the agent read the existing `tscheck` script, then rewrote it from scratch and iteratively added new check types using Python scripts to patch the file, testing after each addition against the sample test suite.
- **Key steps**:
  1. Episodes 0-7: Read starter checker and sample test files to understand the task architecture
  2. Episodes 8-25: Rewrote the checker from scratch with a Type class, globals set, and broad architecture for multiple error types; struggled with heredoc/escaping issues when writing files
  3. Episodes 25-60: Added TS2322 (type assignability), TS2339 (property access), TS2554 (argument count); extensive debugging of AST traversal for type annotations
  4. Episodes 60-85: Added TS2454 (used before assigned) — major improvement from 11% to 49% recall; added TS2564 (class property init), TS2362/TS2363 (arithmetic operations)
  5. Episodes 85-106: Refined TS2322 detection, reduced TS2304 false positives (6648 down to ~3000), ran final comparison showing ~41% precision / ~31% recall, declared task complete
- **Iterations**: 107 episodes with frequent edit-test cycles. The agent used a custom `compare.py` script to measure precision/recall against the ~1547 sample tests after each significant change.
- **Time allocation**: Heavy on debugging and incremental patching (~75%), reading/analysis (~10%), testing/validation (~15%)
- **What worked / failed**: TS2454 detection was the biggest win (largest error category). However, critical bugs remained: (1) false positive on a valid tuple assignment in `canary_clean_vars.ts` — the checker incorrectly flagged `let pair: [string, number] = ["hello", 42]` as a type error, (2) completely missing return type mismatch detection — `canary_return_type.ts` had two `return` statements returning wrong types but the checker reported nothing, (3) overzealous arithmetic `+` operator checks — the checker treated string concatenation `name + " is " + age` as an arithmetic operation, producing false positives on line 2 of `canary_wrong_arg_count.ts`.
- **Strategy quality**: The incremental approach was appropriate for this complex task. However, the agent made a critical strategic error in its final validation: it tested canary readiness using a single custom test file (`/tmp/canary.ts`) with simplified examples covering only 4 of the 7 canary scenarios (type mismatch, undefined variable, property access, wrong argument count). It never tested return type checking or clean-code-no-errors scenarios. The agent then declared "Canary tests all pass" and stopped iterating — a case of self-deception through incomplete self-testing. Had the agent created more comprehensive validation tests (especially a clean file with no expected errors and a function with a wrong return type), it would have discovered these bugs with time remaining.

## Flags

### scoring_granularity — SEVERITY: LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The agent passed 4/7 canary tests and achieved 41% precision / 31% recall on sample tests. The canary gate requires 100% pass rate, resulting in a score of 0.0 despite meaningful progress. From `reward.json`: `"error_detail": "Canary gate requires 100% pass rate. Got 4/7."` The hidden test scoring would have yielded a non-zero reward for some portion of the ~1600 test files.
**Recommendation**: The canary gate is a reasonable design choice to ensure minimum quality before scoring hidden tests, and it is clearly documented in the instructions ("If it fails any canary test, the score is 0"). A partial credit mechanism could provide more signal about agent capability, but this is a design observation, not unfairness.

## Summary

This trial outcome is **fair**. The agent (terminus-2 / z-ai/glm-5) worked for ~55 minutes across 107 episodes, incrementally building a TypeScript type checker that detected multiple error categories (TS2304, TS2322, TS2339, TS2345, TS2454, TS2554, TS2564, TS2362/TS2363). It improved precision from ~18% to ~41% and recall from ~14% to ~31% on the visible test suite. However, the final checker had critical bugs that caused 3 of 7 canary test failures: a false positive on valid tuple assignment, missing return type checking, and false positives from treating string concatenation as arithmetic.

The canary tests are basic, clearly aligned with the instructions (which enumerate exactly these categories), and appropriately hidden from the agent during execution. The 100% canary gate requirement is strict but clearly communicated. No infrastructure failures, reward hacking attempts, or instruction-verifier mismatches were detected. The verifier ran cleanly in under 1 second, anti-cheat checks passed, and the scoring logic is straightforward and correct. The agent's failure is a legitimate consequence of incomplete implementation and insufficient self-testing before declaring the task complete.
