# QA Report: ts-type-checker__sjRrZGQ

## Verdict: FAIR

**Confidence**: 0.90
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s — from result.json timing.agent_execution
**Verifier**: 0.72s — from result.json timing.verifier
**Agent setup**: 21.19s — from result.json timing.agent_setup
**Timed out**: yes (AgentTimeoutError after 7200.0 seconds)

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — added error detection types one by one, iterated using visible test evaluation scripts.
- **Key steps**:
  1. Read the starter checker (TS2304 only) and examined visible test files (episodes 0-5)
  2. Attempted a large rewrite to add TS2322/TS2454/TS2564/TS2339/TS2554 detection (episodes 6-30)
  3. Repeatedly refined TS2304 false positive filtering (parent type skips) and TS2454 detection (episodes 30-80)
  4. Built evaluation scripts to track pass rates (~750/1547 visible tests passing around episode 120)
  5. Spent the latter half (episodes 120-163) attempting to improve TS2322 type assignment checking via better type inference, but never successfully got `canary_type_mismatch`-style basic checks working reliably
- **Iterations**: 164 episodes over 2 hours. The agent frequently ran its own eval script (`/tmp/eval.sh`) to measure progress.
- **Time allocation**: Roughly 10% reading/exploring, 60% writing code patches, 30% running evaluation. The agent spent significant time on complex type inference improvements that didn't materially change the pass rate.
- **What worked / failed**: TS2304, TS2339, TS2554, TS2454 detection worked partially. TS2322 (basic type mismatch — the most common error and a canary requirement) remained broken. The agent's `inferExpr` function could not properly resolve variable types from scope bindings for basic assignment checks like `let x: number = "hello"`.
- **Strategy quality**: The strategy was reasonable in principle — incremental extension with continuous testing is the right approach. However, the agent had a critical blind spot: it spent enormous effort on complex edge cases while never reliably solving the most fundamental TS2322 checks (simple literal-to-annotated-type mismatches). The canary tests require exactly these basic checks, and the agent's failure to prioritize them was the decisive failure. The agent achieved ~755/1547 visible test accuracy but the canary gate zeroed the score entirely. A better strategy would have ensured basic TS2322 checks worked first before tackling edge cases.

## Flags

### partial_success_unrewarded — MEDIUM
**Category**: FALSE_NEGATIVE
**Evidence**: The agent passed 5/7 canary tests (canary_clean_vars, canary_property_missing, canary_undefined_variable, canary_valid_function, canary_wrong_arg_count) and achieved ~755/1547 (49%) on visible tests. It failed 2 canary tests: `canary_type_mismatch.ts` (basic `let x: number = "hello"` patterns, expected lines [1,2,3], got []) and `canary_return_type.ts` (return type mismatches, expected lines [2,6], got []). Because the canary gate requires 100%, the agent received 0.0 despite meaningful partial progress.
**Recommendation**: The canary gate design is intentional — it ensures the checker has minimum viable functionality. However, noting that the agent's final checker did solve a nontrivial portion of the problem. The binary gating is a design choice, not unfairness. A partial credit system (e.g., scoring hidden tests regardless of canary) would capture more signal.

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The canary gate is all-or-nothing: 5/7 canary + 49% visible test accuracy = reward 0.0. The hidden tests were never evaluated because the canary gate failed. The agent's checker successfully detected TS2304, TS2339, TS2554, and TS2454 errors, representing meaningful partial implementation.
**Recommendation**: Consider awarding partial credit even when the canary gate fails, or report hidden test performance as supplementary data. The canary gate prevents evaluating what could be useful signal about the agent's actual capability.

## Summary

The agent used the full 2-hour timeout attempting to build a TypeScript type checker. It made meaningful progress — implementing detection for several error types and passing ~49% of visible tests — but critically failed to implement reliable TS2322 (type mismatch) detection for basic cases like `let x: number = "hello"`. This caused it to fail 2 of 7 canary tests, and the 100% canary gate requirement resulted in a score of 0.0.

The trial outcome is **FAIR**. The canary tests are basic, well-documented requirements (TS2322 is explicitly listed as the second most important error code in the instructions). The 100% canary gate requirement is clearly stated in the instructions ("If it fails any canary test, the score is 0"). The agent had 1,600+ visible test files with TS2322 examples to learn from, and the canary tests are simpler than many of those visible tests. The agent's failure to prioritize basic type assignment checking was a strategic error, not a fairness issue.

No reward hacking, test tampering, or infrastructure failures were detected. The verifier ran cleanly in 0.72s after the agent timed out. Anti-cheat checks passed.
