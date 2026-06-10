# QA Report: ts-type-checker__CPU8t8E

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 120m 0s — timed out at limit
**Verifier**: 0.65s
**Agent setup**: 22s
**Timed out**: yes (AgentTimeoutError after 7200.0 seconds)

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — the agent read the starter `tscheck` script, then iteratively added new type-checking visitors (TS2322 assignment checks, TS2345 argument type checks, TS2554 arity checks, TS2339 property access, TS2493 tuple access) using `sed`, `cat`, and inline Node.js evaluation. Used a keystroke-based terminal interaction pattern (terminus-2 agent).
- **Key steps**:
  1. Read starter checker and explored test file structure (~episodes 0-10)
  2. Extended the checker with TS2322 (type mismatch in assignments/returns), TS2345 (argument type checking), TS2554 (argument count), TS2339 (property access), TS2493 (tuple index) — majority of episodes
  3. Repeatedly tested on individual test files (e.g., `functionCall9.ts`, `arityAndOrderCompatibility01.ts`, `declarationsAndAssignments.ts`) and compared against `.errors` files
  4. Encountered severe performance issues — checker only produced 4 error lines within a 10s timeout near the end
  5. **Fatal error in episode 175**: A `sed` command intended to add debug logging corrupted the main function, breaking the `fs.readdirSync` call chain with an erroneous string replacement
- **Iterations**: ~177 episodes over the full 2-hour timeout, with many edit-test cycles
- **Time allocation**: The agent spent roughly the first hour building type checking features, and the second hour debugging performance issues and attempting to fix the checker's slow processing. The agent was unable to resolve either the performance or the code corruption before timeout.
- **What worked / failed**: The agent successfully added multiple type-checking visitors that could detect errors (TS2322, TS2345, TS2554, TS2339, TS2493). However, the implementation was extremely slow (only processing a few files within 10s). The critical failure was the last `sed` command in episode 175 that corrupted the main function: `sed -i 's/const files = fs.readdirSync/const files = fs.readdirSync(dir).filter(...)...'` which produced broken code where `dir.filter` was called on a string argument instead of the `readdirSync` result. This caused the checker to crash with `TypeError: dir.filter is not a function` during verification, producing zero error output for all canary tests that expected errors.

## Flags

### scoring_granularity — SEVERITY: LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The canary gate requires 100% pass rate (2/7 passed). Even if the checker hadn't been corrupted, the slow performance (4 error lines in 10s on ~1600 test files) and the 120s canary timeout would likely have yielded incomplete output. The agent did implement working type-checking logic for multiple error codes, but the binary canary gate with 100% threshold means any imperfection results in 0 score.
**Recommendation**: This is a design choice, not unfairness. The canary tests are intentionally basic (simple type mismatches, undefined variables, wrong arg counts). An agent that can't pass these fundamental checks has not built a working type checker. The 100% canary threshold is appropriate for this task's minimum viability bar. No change needed.

## Summary

This trial resulted in a legitimate score of 0.0. The agent (terminus-2 with qwen3-coder-next) spent the full 2-hour timeout building a TypeScript type checker, making 177 episodes of edits. The agent successfully implemented multiple type-checking visitors (TS2322, TS2345, TS2554, TS2339, TS2493) that could detect errors in test files. However, two problems prevented success:

1. **Performance**: The checker was extremely slow, producing only 4 error lines within a 10-second timeout when run on the full test suite (~1600 files).
2. **Code corruption**: In the final episode before timeout, a `sed` command intended to add debug logging corrupted the main function, causing the checker to crash with `TypeError: dir.filter is not a function` during verification.

The verifier canary output shows "Processing 7 files" (from the debug console.log) but zero error diagnostics, confirming the checker crashed before producing any type-checking results. The canary gate correctly identified this as a non-functional checker (2/7 — only the two tests expecting no errors passed).

The task is fair: canary tests are basic and clearly described in the instructions, resource limits are adequate (2 other trials in the same batch achieved 0.27 and 0.49 scores), and the verifier properly detected the failure. The agent's failure is attributable to its own code corruption and performance issues, not to any infrastructure or task design problem.
