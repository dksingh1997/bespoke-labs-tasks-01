# C Code Formatter (C Implementation)

A [Harbor](https://github.com/laude-institute/harbor) task that challenges an agent to implement a clang-format-compatible C source code formatter from scratch in C. The agent must build a deterministic, idempotent formatter that produces byte-for-byte identical output to `clang-format` across ~200 test cases.

## The Challenge

The agent is given an empty formatter skeleton (`formatter/main.c`) and a test suite of ~200 formatting cases (input/expected pairs derived from Linux kernel, Redis, SQLite, and edge-case generators). It must implement `format_code()` — the core formatting function — without using `libformat`, `clang-format`, or any existing formatting libraries.

The formatter must:
- Produce byte-for-byte exact matches against expected outputs
- Be deterministic and idempotent (formatting twice must not change the result)
- Preserve code semantics (no renaming, no logic changes)
- Handle all C99/C11 syntax including preprocessor directives
- Run within 30 seconds per file

**Difficulty:** Hard

## Structure

```tree
code-formatter-c-c/
├── instruction.md              # What the agent sees
├── task.toml                   # Harbor task config
├── generate_cases.py           # Script used to generate test cases from clang-format
├── environment/
│   ├── Dockerfile              # GCC/Clang environment
│   └── formatter/              # Formatter codebase (copied to /app)
│       ├── main.c              # Entry point — agent implements format_code()
│       ├── Makefile
│       └── tests/
│           ├── run_suite.sh    # Agent-facing test runner
│           └── cases/          # ~200 test cases (input.c + expected_output.c)
├── solution/
│   └── solve.sh                # Oracle: uses clang-format as the backend
└── tests/
    ├── test.sh                 # Verifier: runs both original + hidden cases
    ├── case_mapping.json       # Maps case numbers to source filenames
    └── hidden_cases/           # Variant cases not visible to the agent
```

## Test Case Coverage

The ~200 test cases cover:

- **Declarations:** variables, arrays, pointers, structs, unions, enums, typedefs
- **Functions:** definitions, declarations, prototypes, variadic, inline, static
- **Control flow:** if/else, for, while, do-while, switch/case, goto, break/continue
- **Preprocessor:** #include, #define, #ifdef, #pragma, #if/#elif/#else/#endif
- **Expressions:** arithmetic, bitwise, logical, ternary, comma, cast, sizeof
- **Pointers:** declaration, dereference, arithmetic, function pointers, arrays of pointers
- **Structs/Unions:** definitions, nested, anonymous, flexible array members
- **Bitfields:** width specifiers, alignment
- **Comments:** line (//), block (/* */), Doxygen-style
- **Macros:** function-like, variadic, multi-line, token pasting (##)
- **Typedefs:** simple, function pointer typedefs, complex declarations

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
