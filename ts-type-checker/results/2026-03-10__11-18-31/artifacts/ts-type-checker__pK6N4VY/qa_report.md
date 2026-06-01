# QA Report: ts-type-checker__pK6N4VY

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 3183s / 53m 3s (44.2% of 7200s timeout)
**Verifier**: 0.9s
**Agent setup**: 20.7s
**Timed out**: no

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — read starter code, study test files, then add error detection types one by one using `cat >>` and python `sed`-style patches.
- **Key steps**:
  1. Explored directory structure, read the starter `tscheck` script (episodes 0-2)
  2. Studied sample test files and their `.errors` expectations (episodes 3-8)
  3. Wrote new check functions (TS2322, TS2339, TS2345, TS2554, TS2454, TS2564, TS2300, TS7006) by appending to the checker file (episodes 9-25)
  4. Spent significant time debugging false positives in TS2454 (used-before-assigned) and TS2300 (duplicate identifier) checks (episodes 30-135)
  5. Final testing and verification on visible test files, then marked task complete (episodes 136-143)
- **Iterations**: 144 episodes over 53 minutes. The agent went through many edit-test cycles, particularly struggling with scope analysis (TS2454 false positives) and property initialization checks.
- **Time allocation**: ~10% reading/exploration, ~40% writing code, ~50% debugging and testing. The agent marked task_complete at episode 140, was asked to confirm, and confirmed at episode 143.
- **What worked / failed**: The agent successfully implemented type mismatch detection (TS2322), undefined variable detection (TS2304), property access checks (TS2339), and argument count checks (TS2554). However, the fundamental bug was that the checker's scope analysis failed to properly register function parameters — it reported parameter names like `a`, `b`, `name`, `age` as TS2304 ("Cannot find name") when they appeared in function bodies. It also missed return-type mismatch detection entirely (canary_return_type.ts scored 0 errors when 2 were expected), and had false positives on object literal type assignments.
- **Strategy quality**: The incremental approach was reasonable for this task. However, the agent had a critical blind spot: it never tested its checker against simple function-parameter-in-scope scenarios before declaring completion. The agent's final analysis (episode 143) claimed all canary error types were being "detected correctly," but this was false — it never ran its checker against canary-like test cases with functions that have typed parameters in the body. The agent also spent too much time on TS2454 (used-before-assigned) which is a complex check, at the expense of ensuring basic scope analysis worked correctly for simpler checks. With 56% of the timeout remaining, the agent declared completion prematurely.

## Flags

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The canary gate requires 100% pass rate (7/7) to proceed to hidden test scoring. The agent passed 3/7 canary tests. Without the canary gate, the hidden test score would provide more signal about partial progress. The canary gate design is documented in `test.sh` line 9: "Reward = hidden_passed / hidden_total (only if canary gate passes)".
**Recommendation**: The canary gate is a reasonable design choice to ensure baseline functionality before scoring. However, running hidden tests even when the canary gate fails (reporting the score separately) would provide useful signal for benchmarking purposes. This is a minor verifier quality note, not an unfairness issue.

## Summary

This trial is **FAIR**. The agent (terminus-2 / qwen3-coder-next) attempted to build a TypeScript type checker by extending the provided starter code over 144 episodes. The core failure was a scope analysis bug: function parameters were not properly registered in scope, causing the checker to report them as undefined variables (TS2304). This produced false positives on 3 of 7 canary tests (`canary_valid_function.ts`, `canary_wrong_arg_count.ts`, `canary_property_missing.ts`), and the checker also missed return-type checking entirely (`canary_return_type.ts`).

The canary gate requirement (100% pass rate) is strict but clearly documented in the instructions ("must pass a small set of basic canary tests that cover fundamental type-checking capabilities"). The canary tests themselves are genuinely basic — they test whether function parameters are in scope, whether return-type mismatches are caught, and whether valid code produces no false positives. These are fundamental type-checking capabilities, and failing them is a legitimate indication that the checker is not ready for broader evaluation.

No evidence of reward hacking, test tampering, or infrastructure failure was found. The verifier ran in under 1 second. The agent used only 44% of its 2-hour timeout before declaring completion, suggesting it could have continued debugging if it had recognized the remaining issues.
