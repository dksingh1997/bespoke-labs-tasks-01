# Java Code Formatter (Java Implementation)

A [Harbor](https://github.com/laude-institute/harbor) task that challenges an agent to implement a google-java-format-compatible Java source code formatter from scratch in Java. The agent must build a deterministic, idempotent formatter that produces byte-for-byte identical output to `google-java-format` across ~200 test cases.

## The Challenge

The agent is given an empty formatter skeleton (`formatter/src/main/java/formatter/Main.java`) and a test suite of ~200 formatting cases (input/expected pairs derived from Google's Guava, Java standard library, and edge-case generators). It must implement `formatCode()` — the core formatting function — without using `google-java-format`, `Eclipse JDT formatter`, `IntelliJ formatter`, or any existing formatting libraries.

The formatter must:
- Produce byte-for-byte exact matches against expected outputs
- Be deterministic and idempotent (formatting twice must not change the result)
- Preserve code semantics (no renaming, no logic changes)
- Handle Java 17+ syntax including records, sealed classes, pattern matching
- Run within 30 seconds per file

**Difficulty:** Hard

## Structure

```tree
code-formatter-java-java/
├── instruction.md              # What the agent sees
├── task.toml                   # Harbor task config
├── generate_cases.py           # Script used to generate test cases from google-java-format
├── environment/
│   ├── Dockerfile              # Java 17 environment
│   └── formatter/              # Formatter codebase (copied to /app)
│       ├── build.gradle
│       └── src/main/java/formatter/
│           └── Main.java       # Entry point — agent implements formatCode()
│       └── tests/
│           ├── run_suite.sh    # Agent-facing test runner
│           └── cases/          # ~200 test cases (input.java + expected_output.java)
├── solution/
│   └── solve.sh                # Oracle: uses google-java-format as the backend
└── tests/
    ├── test.sh                 # Verifier: runs both original + hidden cases
    ├── case_mapping.json       # Maps case numbers to source filenames
    └── hidden_cases/           # Variant cases not visible to the agent
```

## Test Case Coverage

The ~200 test cases cover:

- **Classes:** definitions, inheritance, inner classes, anonymous classes, records
- **Interfaces:** definitions, implementations, default methods, static methods
- **Methods:** signatures, overloading, overriding, varargs, generics
- **Annotations:** single, multiple, nested, marker annotations, repeatable
- **Generics:** type parameters, wildcards, bounded types, type erasure
- **Lambdas:** single/multi-line, method references, functional interfaces
- **Streams:** method chains, collectors, terminal operations
- **Control flow:** if/else, for, while, switch (traditional, enhanced, arrow), try-with-resources
- **Enums:** simple, with fields/methods, constant-specific bodies
- **Exceptions:** try/catch/finally, multi-catch, try-with-resources
- **Imports:** static, wildcard, ordering, grouping
- **Comments:** line, block, Javadoc
- **Records:** definitions, compact constructors, canonical constructors
- **Sealed classes:** permits, non-sealed, sealed interfaces
- **Pattern matching:** instanceof patterns, switch patterns

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
