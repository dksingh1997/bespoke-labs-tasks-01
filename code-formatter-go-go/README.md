# Go Code Formatter (Go Implementation)

A [Harbor](https://github.com/laude-institute/harbor) task that challenges an agent to implement a gofmt-compatible Go source code formatter from scratch in Go. The agent must build a deterministic, idempotent formatter that produces byte-for-byte identical output to `gofmt` across ~200 test cases.

## The Challenge

The agent is given an empty formatter skeleton (`formatter/main.go`) and a test suite of ~200 formatting cases (input/expected pairs derived from Go's standard library, community projects, and edge-case generators). It must implement `FormatCode()` — the core formatting function — without using `go/format`, `go/printer`, or any existing formatting libraries.

The formatter must:
- Produce byte-for-byte exact matches against expected outputs
- Be deterministic and idempotent (formatting twice must not change the result)
- Preserve code semantics (no renaming, no logic changes)
- Handle all Go syntax including generics (Go 1.18+)
- Run within 30 seconds per file

**Difficulty:** Hard

## Structure

```tree
code-formatter-go-go/
├── instruction.md              # What the agent sees
├── task.toml                   # Harbor task config
├── generate_cases.py           # Script used to generate test cases from gofmt
├── environment/
│   ├── Dockerfile              # Go 1.22 environment
│   └── formatter/              # Formatter codebase (copied to /app)
│       ├── main.go             # Entry point — agent implements FormatCode()
│       └── tests/
│           ├── run_suite.sh    # Agent-facing test runner
│           └── cases/          # ~200 test cases (input.go + expected_output.go)
├── solution/
│   └── solve.sh                # Oracle: uses go/format as the backend
└── tests/
    ├── test.sh                 # Verifier: runs both original + hidden cases
    ├── case_mapping.json       # Maps case numbers to source filenames
    └── hidden_cases/           # Variant cases not visible to the agent
```

## Test Case Coverage

The ~200 test cases cover:

- **Declarations:** variables (`var`, `:=`), constants, types, functions, methods
- **Control flow:** if/else, for (all forms), switch (expression, type), select, range
- **Data literals:** structs, arrays, slices, maps, composite literals, nested literals
- **Interfaces:** method sets, type constraints, embedded interfaces, generic constraints
- **Goroutines/channels:** go, chan, buffered/unbuffered, select with cases
- **Error handling:** defer, panic, recover, error wrapping
- **Generics:** type parameters, constraints, instantiation, method type params
- **Comments:** line, block, doc comments, comment groups, commented-out code
- **Formatting edge cases:** long lines, alignment, blank lines, trailing commas, operator spacing

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
