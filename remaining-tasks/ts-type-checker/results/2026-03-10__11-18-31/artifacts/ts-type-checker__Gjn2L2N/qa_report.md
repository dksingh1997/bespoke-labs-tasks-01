# QA Report: ts-type-checker__Gjn2L2N

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s — from result.json timing.agent_execution (11:26:21 to 13:26:21)
**Verifier**: 0.7s — from result.json timing.verifier (13:26:21 to 13:26:21)
**Agent setup**: 22.2s — from result.json timing.agent_setup (11:25:59 to 11:26:21)
**Timed out**: yes (AgentTimeoutError after 7200.0 seconds)

## Agent Strategy

- **Approach**: Repeated full rewrites of the checker with heavy debugging of specific test files, struggling with shell escaping and file corruption issues throughout.
- **Key steps**:
  1. Read the starter checker and explored the directory structure (episodes 0-5)
  2. First full rewrite of `/app/checker/tscheck` adding TS2322, TS2339, TS2554, TS2345 support (episode 15)
  3. Multiple rewrites attempting to fix type inference for assignments and interface/array types (episodes 20, 28, 62, 66, 84, 94, 99, 100, 105, 106)
  4. Extensive debugging of specific test files (e.g., `arityAndOrderCompatibility01.ts`, `arrayAssignmentTest4.ts`) using ad-hoc scripts in `/tmp/` (episodes 50-127)
  5. From episode 128 onward, response files are empty — likely the LLM (qwen3-coder-next) began producing responses too slowly or failing to respond, with API request times reaching 100-200 seconds. The agent had 354 total episodes but only 128 had content.
- **Iterations**: At least 10 full rewrites of the checker file. The agent repeatedly replaced the entire checker content via heredocs, often encountering file corruption from shell escaping issues (leading to use of Python base64 workarounds at episode 105).
- **Time allocation**: ~5% exploring/reading, ~30% writing checker rewrites, ~30% debugging individual test files with /tmp/ scripts, ~35% consumed by empty-response episodes (128-353) where the LLM failed to produce valid output.
- **What worked / failed**: The final checker successfully detected TS2304 (undefined variables), TS2322 for return type mismatches, and partially TS2554 (caught too-few-args but missed too-many-args). However, it failed on fundamental TS2322 cases (simple variable assignment type mismatches like `let x: number = "hello"`), TS2339 (property access on missing properties), and the too-many-args case of TS2554. The canary output confirms the checker produced: 2 TS2322 return-type errors, 2 TS2304 errors, and 1 TS2554 error — but missed 3 TS2322 assignment errors, 1 TS2339 error, and 1 TS2554 error.
- **Strategy quality**: Poor. Key issues:
  - **Repeated full rewrites**: Instead of incrementally adding checks, the agent repeatedly overwrote the entire checker. This is error-prone and meant each rewrite had to re-implement everything.
  - **File corruption loop**: Shell escaping issues with heredocs corrupted the file multiple times, wasting time.
  - **Focus on edge cases over basics**: Spent many episodes debugging complex interface/array type compatibility for a specific test file while basic variable assignment type checking (`let x: number = "hello"`) was broken.
  - **LLM reliability**: The qwen3-coder-next model appeared to fail from episode 128 onward, wasting ~65% of the time budget. While not the agent framework's fault, this contributed to the incomplete result.
  - **No canary-focused validation**: The agent never tested against simple type mismatch assignments that would have revealed the critical gap needed for canary tests.

## Flags

### scoring_granularity — LOW
**Category**: VERIFIER_QUALITY
**Evidence**: The canary gate requires 100% (7/7) to proceed to hidden tests. The agent passed 4/7 canary tests (canary_clean_vars, canary_return_type, canary_undefined_variable, canary_valid_function) and had partial functionality. With the canary gate design, the agent gets 0.0 despite having a partially working checker that handles TS2304 and some TS2322/TS2554 cases.
**Recommendation**: The canary tests are intentionally basic and serve as a quality floor for fundamental type-checking capabilities. The 100% requirement is reasonable — failing to detect `let x: number = "hello"` as a type error indicates a fundamental gap. This is a design choice, not a fairness issue, so severity is LOW.

## Summary

The trial outcome is **FAIR**. The agent (terminus-2 with qwen3-coder-next) used the full 2-hour timeout and scored 0.0 because it failed the canary gate (4/7 passed). The three failed canary tests cover basic type checking: simple variable type mismatches (`let x: number = "hello"` — no errors detected), property access on missing properties (`p.z` where `z` doesn't exist on the interface — no errors detected), and too-many-arguments in function calls (`greet("Bob", 30, true)` — missed).

The agent did make substantial progress — it rewrote the checker at least 10 times, implementing detection for TS2304, TS2322 (return types), and TS2554 (too-few args). However, its implementation had a critical gap: it failed to detect type mismatches in simple variable assignments, which is one of the most fundamental type-checking scenarios. This gap directly caused the canary gate failure.

The agent's strategy was undermined by three factors: (1) repeated full rewrites instead of incremental development, (2) shell escaping issues corrupting the checker file, and (3) the LLM apparently failing to produce valid responses from episode 128 onward, consuming ~65% of the time budget. The LLM reliability issue is notable but is an agent/model concern, not an infrastructure or task fairness issue — the Harbor framework correctly detected the timeout and ran verification.

The verifier operated correctly: anti-cheat checks passed, canary tests were properly evaluated, and the 0.0 score accurately reflects the checker's failure to meet the basic quality bar. No reward hacking, test tampering, or infrastructure failures were detected.
