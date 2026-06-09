# QA Report: ts-type-checker__iNryamZ

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.273381

## Timing

**Agent execution**: 2212s / 36m 52s (of 7200s allowed — used ~31%)
**Verifier**: 4.5s
**Agent setup**: 21.3s
**Timed out**: no

## Agent Strategy

- **Approach**: Incremental extension of the starter checker — read the existing code, studied test files, then attempted to rewrite the checker with additional type-checking capabilities (TS2322, TS2339, TS2554, TS2345, TS7006, TS2564) on top of the existing TS2304 detection.
- **Key steps**:
  1. Read the starter `/app/checker/tscheck` script (episodes 0-3) to understand existing parsing, directive handling, and TS2304 logic.
  2. Studied sample test files and their `.errors` outputs to understand expected error patterns (episode 4).
  3. Attempted multiple times to overwrite the checker file using shell heredocs and Python scripts — repeatedly failed due to command-length or escaping issues (episodes 5-24).
  4. Finally succeeded in writing the new checker via chunked `cat` heredocs (episode 24), implemented basic type inference, assignability checking, property access, and function call argument checking.
  5. Verified the canary test passed and marked task complete (episodes 25-26).
- **Iterations**: ~6 edit-test cycles, but many episodes were spent debugging file write failures rather than improving the type checker logic.
- **Time allocation**: ~15% reading/understanding, ~60% fighting file write issues, ~25% writing and testing the actual checker code.
- **What worked / failed**: The agent successfully built a type checker that handles basic type mismatches (TS2322), undefined variables (TS2304), property access (TS2339), and argument count (TS2554). The major failure point was excessive time wasted on file writing mechanics — the agent's heredoc-based approach to writing large files kept failing, and it took ~20 episodes to get a working file in place. This left very little time for iterating on the checker's accuracy.
- **Strategy quality**: Mixed. The approach of extending the starter was correct, and the final checker implemented a reasonable breadth of checks. However, the agent used only ~37 minutes of its 2-hour budget, marking the task complete after just getting the canary to pass. It did not iterate on the hidden test categories or attempt to validate against the ~1600 visible test files. A more thorough agent would have run the checker against visible tests, analyzed false positives/negatives, and refined the logic. The agent also struggled unnecessarily with file writing — a more experienced approach (e.g., writing via `node -e` or Python `open().write()`) would have saved significant time.

## Flags

(No flags — no issues found)

## Summary

This trial completed normally with no infrastructure failures, no reward hacking, and no task fairness issues. The agent (GPT-5.2 Codex via terminus-2) built a TypeScript type checker that passed all 7 canary tests and 380 of 1390 hidden tests (27.34%), earning a reward of 0.273381.

The scoring mechanism is continuous (proportion of hidden tests passed, gated by 100% canary pass rate), which is well-designed and appropriate for this task. The verifier includes anti-cheat checks for tsc usage, typescript package imports, reward file manipulation, and test data access — all of which passed cleanly for this agent.

The agent's main weakness was poor time management. It used only ~37 minutes of its 2-hour budget, spending most of that time fighting file write issues rather than iterating on type checker accuracy. The final implementation handles basic checks but lacks the depth needed for more complex TypeScript features (interfaces, generics, control flow analysis, advanced class features), as reflected in the low pass rates for categories like conformance/types (10%), conformance/expressions (10.7%), and conformance/interfaces (3.3%). This is a legitimate performance outcome — the task is rated "very_hard" and partial success is properly rewarded.
