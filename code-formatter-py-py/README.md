# Python Code Formatter (Python Implementation)

A [Harbor](https://github.com/laude-institute/harbor) task that challenges an agent to implement a black-compatible Python code formatter from scratch in Python. The agent must build a deterministic, idempotent formatter that produces byte-for-byte identical output to `black` across ~200 test cases.

## The Challenge

The agent is given an empty formatter skeleton (`formatter/main.py`) and a test suite of ~200 formatting cases (input/expected pairs derived from Python standard library, popular packages, and edge-case generators). It must implement `format_code()` — the core formatting function — without using `black`, `autopep8`, `yapf`, `isort`, or any existing formatting libraries.

The formatter must:
- Produce byte-for-byte exact matches against expected outputs
- Be deterministic and idempotent (formatting twice must not change the result)
- Preserve code semantics (no renaming, no logic changes)
- Handle Python 3.10+ syntax including match/case, type unions, etc.
- Run within 30 seconds per file

**Difficulty:** Hard

## Structure

```tree
code-formatter-py-py/
├── instruction.md              # What the agent sees
├── task.toml                   # Harbor task config
├── generate_cases.py           # Script used to generate test cases from black
├── environment/
│   ├── Dockerfile              # Python 3.12 environment
│   └── formatter/              # Formatter codebase (copied to /app)
│       ├── main.py             # Entry point — agent implements format_code()
│       └── tests/
│           ├── run_suite.sh    # Agent-facing test runner
│           └── cases/          # ~200 test cases (input.py + expected_output.py)
├── solution/
│   └── solve.sh                # Oracle: uses black as the backend
└── tests/
    ├── test.sh                 # Verifier: runs both original + hidden cases
    ├── case_mapping.json       # Maps case numbers to source filenames
    └── hidden_cases/           # Variant cases not visible to the agent
```

## Test Case Coverage

The ~200 test cases cover:

- **Imports:** single, multiline, from-imports, aliases, wildcard
- **Functions:** definitions, decorators, default args, *args/**kwargs, async
- **Classes:** definitions, inheritance, methods, properties, dataclasses
- **Control flow:** if/elif/else, for, while, try/except/finally, with, match/case
- **Comprehensions:** list, dict, set, generator expressions, nested
- **Strings:** single/double quotes, f-strings, triple-quoted, raw strings, byte strings
- **Type hints:** annotations, unions (X | Y), generics, Protocol, TypeVar
- **Data structures:** lists, dicts, sets, tuples, nested structures
- **Operators:** arithmetic, comparison, boolean, walrus, matrix multiply
- **Comments:** inline, block, docstrings, type: ignore, noqa
- **Line wrapping:** long lines, magic trailing comma, multiline expressions

## Reward Function

The reward is the **fraction of test cases passed** (byte-for-byte match) across both the original suite (visible to the agent) and a hidden variant suite (not visible).

```
reward = passed / total
```

Each case is scored pass/fail with a 30-second timeout. Crashes and timeouts count as failures.

## Results

| Model | Pass Rate | Passed | Total | Time |
|-------|-----------|--------|-------|------|
| (pending evaluation) | | | | |

## Running

```bash
# Sanity check with the Oracle agent (should give reward = 1.0)
harbor run -p . -k 5

# Evaluate an agent
harbor run -p . -a <agent> -m <model> -k <num_attempts>
```
