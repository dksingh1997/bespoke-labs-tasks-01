# QA Report: ts-type-checker__fU6MHcU

## Verdict: FAIR

**Confidence**: 0.92
**Reward**: 0.0

## Timing

**Agent execution**: 4094s / 68m 14s (of 7200s allowed)
**Verifier**: 0.8s
**Agent setup**: 22s
**Timed out**: no

## Agent Strategy

- **Approach**: Incremental extension of a starter checker, building a custom TypeScript type-checker using Babel AST traversal. Multiple full rewrites of the checker script throughout the session.
- **Key steps**:
  1. Read starter checker code and sample test files (episodes 0-7)
  2. Built initial comprehensive checker with TS2304, TS2322, TS2339, TS2554 support (episodes 8-27)
  3. Struggled extensively with `isAssignable` bug that returned `true` by default, preventing TS2322 detection (episodes 64-94, ~30 episodes)
  4. Added MemberExpression visitor for TS2339 property access on primitives (episodes 108-112)
  5. Verified against self-created ad-hoc tests in `/tmp/`, concluded checker was ready (episodes 113-116)
- **Iterations**: The agent rewrote the checker file at least 8 times from scratch (episodes 8, 47, 49, 52, 55, 82, 84, 112). It also created many standalone debug scripts. Total of 117 episodes.
- **Time allocation**: Approximately 10% exploring/reading (ep 0-7), 20% initial implementation (ep 8-47), 40% debugging isAssignable bug (ep 64-94), 20% adding TS2339/TS2345 (ep 95-112), 10% validation and submission (ep 113-116).
- **What worked / failed**: The agent successfully implemented TS2304, TS2322 (variable assignment), TS2554, and basic TS2339 for primitive types. It **failed** to implement ReturnStatement type checking (needed for `canary_return_type.ts`) and had an off-by-one error in interface property access detection (reported line 6 instead of 7 for `canary_property_missing.ts`). The match rate on visible tests was only 3.7%.
- **Strategy quality**: Poor overall. The agent:
  - Spent an enormous amount of time (30+ episodes) debugging a single `isAssignable` bug that should have been caught much earlier with basic unit testing.
  - Never tested against the actual canary test patterns described in the instructions (return type mismatches, property access on interfaces). It only tested with simplified ad-hoc tests it created in `/tmp/`.
  - Rewrote the entire checker 8+ times from scratch, losing incremental progress each time.
  - Never implemented ReturnStatement checking, which is a fundamental type-checking capability mentioned in the instructions.
  - Only checked primitive property access (number/string methods) for TS2339, missing interface property checking entirely — the checker reported an error on the wrong line for `canary_property_missing.ts` because it flagged the assignment on line 6 rather than the `p.z` access on line 7.
  - Did not effectively use the ~1,600 sample test files and `.errors` files to validate its implementation against specific known patterns.

## Flags

### scoring_granularity — SEVERITY: LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The canary gate requires 100% (7/7) to proceed to hidden test scoring. The agent passed 5/7 canary tests. With proportional hidden test scoring available, the agent's partial success on canary tests and its 3.7% match rate on visible tests is completely invisible in the final score of 0.0.
**Recommendation**: Consider allowing agents that pass a majority of canary tests (e.g., 5/7) to proceed to hidden test scoring with a penalty, so that partial progress is reflected in the score. Alternatively, the current design is defensible as the canary tests specifically cover "fundamental type-checking capabilities" and failing any indicates a gap in basic functionality.

## Summary

This trial is **fair**. The agent (terminus-2 with z-ai/glm-5) attempted to build a TypeScript type checker by extending a starter Babel-based checker. It used 68 of the available 120 minutes and went through 117 episodes, but failed to pass the canary gate (5/7 tests).

The two canary failures were legitimate: (1) `canary_return_type.ts` — the agent never implemented return statement type checking, a fundamental capability; (2) `canary_property_missing.ts` — the agent's interface property access checking was buggy, reporting an error on the wrong line (line 6 instead of line 7). These are genuine implementation gaps, not infrastructure or fairness issues.

The verifier operated correctly: anti-cheat checks passed, the canary gate was properly enforced, and the 0 reward accurately reflects the agent's failure to meet the minimum quality bar. The canary tests are reasonable and well-documented in the instructions. No reward hacking or infrastructure failures were detected.
