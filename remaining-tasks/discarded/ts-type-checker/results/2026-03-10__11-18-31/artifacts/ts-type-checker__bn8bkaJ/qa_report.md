# QA Report: ts-type-checker__bn8bkaJ

## Verdict: FAIR

**Confidence**: 0.90
**Reward**: 0.0

## Timing

**Agent execution**: 3122.9s / 52m 3s — from result.json timing.agent_execution
**Verifier**: 1.1s — from result.json timing.verifier
**Agent setup**: 20.7s — from result.json timing.agent_setup
**Timed out**: no

## Agent Strategy

- **Approach**: Incremental extension of a starter type checker — read the existing code, then built a type system (type inference, assignability checking, property access, function call checking) via Python-scripted code patches inserted into the Node.js checker script.
- **Key steps**:
  1. Read and understood the existing `tscheck` starter (episodes 0-4), which only handled TS2304 (undefined names).
  2. Explored lib files and sample test directory structure (episode 5).
  3. Attempted to insert a large block of type system code via `apply_patch` and heredoc, which failed multiple times (episodes 6-17). The agent struggled significantly with file editing mechanics.
  4. Eventually built the new code in chunks via `/tmp/newcode.js` and Python patching scripts (episodes 15-27), implementing: type inference from annotations, `isAssignable` for primitives/unions/arrays/tuples/objects, `checkTypes` for TS2322/TS2339/TS2345/TS2554/TS7006.
  5. Ran a quick test on sample files and patched false positive issues (episodes 28-30: e.g., treating unknown type references as `any` to reduce false TS2304 errors, handling generic type parameters).
- **Iterations**: ~34 episodes total, but many were spent fighting the file editing tooling (heredocs getting mangled, apply_patch not available, Python scripts failing). Approximately 4-5 meaningful test-fix cycles.
- **Time allocation**: Roughly 30% reading/understanding, 50% writing code (fighting with tooling), 15% testing, 5% final patches. The agent used only ~52 minutes of the available 2 hours and declared the task complete.
- **What worked / failed**: The agent successfully built a working type checker that handles many error types. However, it had a critical bug in tuple literal type inference — when encountering `["hello", 42]` assigned to `[string, number]`, the checker flagged a false positive TS2322 error on the canary test `canary_clean_vars.ts` line 5. The likely root cause is that array literal expressions like `["hello", 42]` were inferred as a generic array type rather than a compatible tuple, and the `isAssignable` check failed when comparing this inferred type against the declared tuple type `[string, number]`.
- **Strategy quality**: The incremental approach was reasonable for this task. The agent chose to extend the starter rather than rewrite from scratch, which was sound. However, two issues stand out: (1) The agent declared the task complete after only 52 minutes of 120 available, without running the checker against a broader set of test files or writing a simple tuple assignment test. A single test with `let pair: [string, number] = ["hello", 42]` would have caught the bug. (2) The agent spent excessive time wrestling with file editing mechanics rather than implementing and testing. The premature completion was the critical strategic error — the agent had 68 more minutes to find and fix this bug.

## Flags

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The agent passed 6/7 canary tests and implemented working type-checking for TS2322, TS2339, TS2345, TS2554, TS7006, and TS2304. The canary gate requires 100% (7/7) to proceed to hidden tests, so the agent scored 0.0 despite having a mostly-working solution with one false-positive bug on tuple literal inference. The canary output shows the agent correctly handled 5 other canary scenarios (type mismatch, undefined variable, return type, property missing, wrong arg count).
**Recommendation**: The canary gate design is intentional — it ensures basic competency before scoring on hidden tests. However, partial credit for hidden test performance conditional on canary near-pass (e.g., 6/7) could provide more signal. This is a design suggestion, not an unfairness finding.

## Summary

This trial is **FAIR**. The agent (GPT-5.2-Codex via terminus-2) worked on building a TypeScript type checker by extending a starter script. It implemented multiple error type checks but had a bug in tuple type inference that caused a false positive on `canary_clean_vars.ts` line 5 (`let pair: [string, number] = ["hello", 42]` was incorrectly flagged as TS2322). This caused the canary gate to fail (6/7 required 7/7), resulting in a score of 0.0.

The infrastructure functioned correctly — environment built, agent setup succeeded, agent executed without timeout, verifier ran in ~1 second, and anti-cheat checks passed. No reward hacking was attempted. The canary gate failure was a legitimate consequence of a bug in the agent's type checker implementation, specifically in how it handles array literal expressions assigned to tuple types.

The main strategic critique is that the agent declared the task complete after using only 52 of the available 120 minutes. More thorough testing, particularly a simple tuple assignment scenario, would likely have revealed and allowed fixing this bug. The task itself was clearly specified, the canary tests are reasonable basic checks, and the 100% canary gate requirement was documented in the instructions.
