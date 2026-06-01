# Rust Code Formatter (Rust Implementation)

A [Harbor](https://github.com/laude-institute/harbor) task that challenges an agent to implement a rustfmt-compatible Rust source code formatter from scratch in Rust. The agent must build a deterministic, idempotent formatter that produces byte-for-byte identical output to `rustfmt` across ~200 test cases.

## The Challenge

The agent is given an empty formatter skeleton (`formatter/src/main.rs`) and a test suite of ~200 formatting cases (input/expected pairs derived from Rust's standard library, popular crates, and edge-case generators). It must implement `format_code()` — the core formatting function — without using `rustfmt` as a library or shelling out to it.

The formatter must:
- Produce byte-for-byte exact matches against expected outputs
- Be deterministic and idempotent (formatting twice must not change the result)
- Preserve code semantics (no renaming, no logic changes)
- Handle all Rust syntax including async/await, traits, lifetimes, macros
- Run within 30 seconds per file

**Difficulty:** Hard

## Structure

```tree
code-formatter-rust-rs/
├── instruction.md              # What the agent sees
├── task.toml                   # Harbor task config
├── generate_cases.py           # Script used to generate test cases from rustfmt
├── environment/
│   ├── Dockerfile              # Rust 1.77 environment
│   └── formatter/              # Formatter codebase (copied to /app)
│       ├── Cargo.toml
│       └── src/
│           └── main.rs         # Entry point — agent implements format_code()
│       └── tests/
│           ├── run_suite.sh    # Agent-facing test runner
│           └── cases/          # ~200 test cases (input.rs + expected_output.rs)
├── solution/
│   └── solve.sh                # Oracle: uses rustfmt as the backend
└── tests/
    ├── test.sh                 # Verifier: runs both original + hidden cases
    ├── case_mapping.json       # Maps case numbers to source filenames
    └── hidden_cases/           # Variant cases not visible to the agent
```

## Test Case Coverage

The ~200 test cases cover:

- **Variables/Bindings:** let, let mut, destructuring, type annotations
- **Functions:** signatures, closures, async, unsafe, extern
- **Structs/Enums:** fields, variants, tuple structs, unit structs, derive macros
- **Traits:** definitions, implementations, associated types, trait objects, bounds
- **Generics:** type parameters, where clauses, lifetime parameters, const generics
- **Pattern matching:** match, if let, while let, nested patterns
- **Macros:** macro_rules!, derive macros, function-like macros
- **Modules:** mod, use, pub, visibility modifiers
- **Error handling:** Result, Option, ?, unwrap chains
- **Strings:** format!, println!, string interpolation, raw strings
- **Collections:** Vec, HashMap, BTreeMap, iterators, method chains
- **Attributes:** #[derive(...)], #![cfg(...)], doc comments

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
