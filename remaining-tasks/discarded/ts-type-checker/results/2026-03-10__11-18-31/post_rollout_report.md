# Post-Rollout Report: 2026-03-10__11-18-31

**Generated**: 2026-03-10 20:04:37
**Trials**: 12

## Results

| Trial | Model | Reward | Agent Time | Failure Mode | QA Verdict |
|-------|-------|--------|------------|--------------|------------|
| ts-type-checker__2NEpR7W | claude-opus-4-6 | 0.0000 | 2h 0m 0s | error: canary_gate_failed | FAIR |
| ts-type-checker__CPU8t8E | qwen3-coder-next | 0.0000 | 2h 0m 0s | error: canary_gate_failed | FAIR |
| ts-type-checker__Cmn8La7 | gpt-5.2-codex | 0.0000 | 39m 25s | error: canary_gate_failed | FAIR |
| ts-type-checker__Gjn2L2N | qwen3-coder-next | 0.0000 | 2h 0m 0s | error: canary_gate_failed | FAIR |
| ts-type-checker__VCxx5Zw | glm-5 | 0.0000 | 55m 6s | error: canary_gate_failed | FAIR |
| ts-type-checker__YyLE7LD | glm-5 | 0.0000 | 1h 2m 57s | error: canary_gate_failed | FAIR |
| ts-type-checker__bn8bkaJ | gpt-5.2-codex | 0.0000 | 52m 2s | error: canary_gate_failed | FAIR |
| ts-type-checker__fU6MHcU | glm-5 | 0.0000 | 1h 8m 14s | error: canary_gate_failed | FAIR |
| ts-type-checker__iNryamZ | gpt-5.2-codex | 0.2734 | 36m 52s | success | FAIR |
| ts-type-checker__pK6N4VY | qwen3-coder-next | 0.0000 | 53m 3s | error: canary_gate_failed | FAIR |
| ts-type-checker__qDvqxSk | claude-opus-4-6 | 0.4928 | 2h 0m 0s | success | FAIR |
| ts-type-checker__sjRrZGQ | claude-opus-4-6 | 0.0000 | 2h 0m 0s | error: canary_gate_failed | FAIR |

## Failure Patterns

- **error: canary_gate_failed** (10): ts-type-checker__2NEpR7W, ts-type-checker__CPU8t8E, ts-type-checker__Cmn8La7, ts-type-checker__Gjn2L2N, ts-type-checker__VCxx5Zw ... +5 more
- **success** (2): ts-type-checker__iNryamZ, ts-type-checker__qDvqxSk

## Performance by Model

### terminus-2/claude-opus-4-6

- **Trials**: 3
- **Success rate**: 1/3 (33%)
- **Mean reward**: 0.1643
- **Mean time**: 2h 0m 0s
- **Outcomes**: error: canary_gate_failed (2), success (1)

### terminus-2/gpt-5.2-codex

- **Trials**: 3
- **Success rate**: 1/3 (33%)
- **Mean reward**: 0.0911
- **Mean time**: 42m 46s
- **Outcomes**: error: canary_gate_failed (2), success (1)

### terminus-2/qwen/qwen3-coder-next

- **Trials**: 3
- **Success rate**: 0/3 (0%)
- **Mean reward**: 0.0000
- **Mean time**: 1h 37m 41s
- **Outcomes**: error: canary_gate_failed (3)

### terminus-2/z-ai/glm-5

- **Trials**: 3
- **Success rate**: 0/3 (0%)
- **Mean reward**: 0.0000
- **Mean time**: 1h 2m 6s
- **Outcomes**: error: canary_gate_failed (3)


## Agent Strategies

- **ts-type-checker__2NEpR7W** (reward=0.0000): Big-bang rewrite attempt: analyzed error patterns thoroughly, then tried to write a comprehensive new checker from scratch but failed repeatedly to write large files through shell heredocs, never deploying a working extended checker before timing out.
- **ts-type-checker__CPU8t8E** (reward=0.0000): Incremental extension of starter checker with multiple type-checking visitors (TS2322, TS2345, TS2554, TS2339, TS2493), but a fatal sed command in the last episode corrupted the main function, causing the checker to crash during verification.
- **ts-type-checker__Cmn8La7** (reward=0.0000): Incremental extension of starter checker: added TS2322, TS2339, TS2554, TS2345 support but failed canary gate (5/7) due to tuple assignment false positive and missing interface property access detection
- **ts-type-checker__Gjn2L2N** (reward=0.0000): Repeated full rewrites of the checker with heavy debugging of specific test files, struggling with shell escaping and LLM reliability issues, ultimately failing to implement basic variable assignment type checking despite 2 hours of work.
- **ts-type-checker__VCxx5Zw** (reward=0.0000): Incremental extension of starter checker: rewrote from scratch then iteratively added error checks (TS2304, TS2322, TS2339, TS2454, TS2554, TS2564, TS2362/TS2363) using Python patch scripts, achieving ~41% precision / ~31% recall on visible tests but failing canary gate 4/7 due to missing return type checking, false positive on tuples, and over-eager arithmetic checks
- **ts-type-checker__YyLE7LD** (reward=0.0000): Incremental extension of starter checker — read existing code, studied test files, then added checks for TS2304/TS2322/TS2339/TS2554 using python3 string-replace patches. Achieved 22.9% on visible tests but failed canary gate (5/7) due to missing return-type checking and a false positive on object literal assignment.
- **ts-type-checker__bn8bkaJ** (reward=0.0000): Incremental extension of starter type checker: read existing code, built type system (inference, assignability, property access, function calls) via Python-scripted patches, but had a tuple inference bug causing canary failure
- **ts-type-checker__fU6MHcU** (reward=0.0000): Incremental extension of starter Babel-based checker through multiple full rewrites (8+ times), adding TS2304/TS2322/TS2339/TS2554 support but failing to implement return statement type checking and having off-by-one bug in interface property access. Failed canary gate 5/7.
- **ts-type-checker__iNryamZ** (reward=0.2734): Incremental extension of starter checker: read existing code, studied test files, then rewrote the checker to add TS2322/TS2339/TS2554/TS2345/TS7006 checks. Struggled with file write mechanics, used only 37min of 2hr budget.
- **ts-type-checker__pK6N4VY** (reward=0.0000): Incremental extension of starter checker: added TS2322/TS2339/TS2345/TS2554/TS2454 checks via appending and patching, but failed to properly register function parameters in scope, causing fatal false positives on canary tests
- **ts-type-checker__qDvqxSk** (reward=0.4928): Incremental extension of starter checker with iterative FP/FN analysis — data-driven tuning over 273 episodes, achieving 685/1390 hidden tests before timeout
- **ts-type-checker__sjRrZGQ** (reward=0.0000): Incremental extension of starter checker over 164 episodes, reaching ~49% visible test accuracy, but failed to implement basic TS2322 type mismatch detection needed for canary gate

## Score Statistics

- **Trials**: 12
- **Success rate**: 2/12 (17%)
- **Mean reward**: 0.0638
- **Range**: 0.0000 – 0.4928

## Cost & Token Usage

- **Total cost**: $76.01
- **Mean cost per trial**: $6.33
- **Total input tokens**: 164,007,349
- **Total output tokens**: 1,584,383
- **Mean tokens per trial**: 13,667,279 in / 132,031 out

## Timeout Utilisation

- **Agent timeout**: 2h 0m 0s
- **Mean agent time**: 1h 20m 38s (67% of timeout)
- **Verifier timeout**: 2h 0m 0s
- **Mean verifier time**: 1s (0% of timeout)

## Oracle Comparison

No oracle data found.

## Recommendations

No specific recommendations.
