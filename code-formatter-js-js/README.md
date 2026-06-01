# JS/TS Code Formatter (JavaScript Implementation)

A [Harbor](https://github.com/laude-institute/harbor) task that challenges an agent to implement a Prettier-compatible JavaScript/TypeScript code formatter from scratch in JavaScript (Node.js). The agent must build a deterministic, idempotent formatter that produces byte-for-byte identical output to Prettier across 277 test cases.

## The Challenge

The agent is given an empty formatter skeleton (`formatter/main.js`) and a test suite of 277 formatting cases (input/expected pairs derived from Prettier's snapshot tests). It must implement `formatCode()` — the core formatting function — without using any existing formatting libraries (Prettier, ESLint, Biome, dprint, etc.).

The formatter must:
- Produce byte-for-byte exact matches against expected outputs
- Be deterministic and idempotent (formatting twice must not change the result)
- Preserve code semantics (no renaming, no logic changes)
- Handle both JavaScript and TypeScript syntax
- Run within 30 seconds per file

**Difficulty:** Hard

## Structure

```tree
code-formatter-js-js/
├── instruction.md              # What the agent sees
├── task.toml                   # Harbor task config
├── generate_cases.py           # Script used to generate test cases from Prettier
├── environment/
│   ├── Dockerfile              # Node.js 20 environment
│   └── formatter/              # Formatter codebase (copied to /app)
│       ├── main.js             # Entry point — agent implements formatCode()
│       └── tests/
│           ├── run_suite.sh    # Agent-facing test runner
│           └── cases/          # 277 test cases (input.js/ts + expected_output.js/ts)
├── solution/
│   └── solve.sh                # Oracle: installs Prettier as the backend
└── tests/
    ├── test.sh                 # Verifier: runs both original + hidden cases
    ├── case_mapping.json       # Maps case numbers to source filenames
    └── hidden_cases/           # Variant cases not visible to the agent
```

## Test Case Coverage

The 277 test cases are extracted from [Prettier's snapshot tests](https://github.com/prettier/prettier/tree/main/tests/format) and cover:

- **JavaScript (120 cases):** arrays, arrows, assignment, async, call chains, classes, comments, conditionals, decorators, destructuring, exports, for loops, functions, generators, if/else, imports, method chains, objects, optional chaining, quotes, regex, rest/spread, return, strings, switch, template literals, ternaries, trailing commas, try/catch, unary, variables, while, yield
- **JSX (19 cases):** elements, fragments, attributes, text wrapping, escaping, newlines, parentheses, whitespace
- **TypeScript (142 cases):** abstract classes, arrow functions, as/assert expressions, assignments, bigint, binary expressions, call signatures, casts, classes, conditional types, const, declarations, definite assignments, destructuring, enums, exports, function types, generics, index signatures, interfaces, intersections, keywords, last-argument expansion, literals, mapped types, methods, modules, namespaces, object multiline, optional chaining/calls/methods/types, predicate types, quote props, readonly, rest types, satisfies, static blocks, template literal types, ternaries, trailing commas, TSX, tuples, type aliases, typeof, unions, update expressions

## Reward Function

The reward is the **fraction of test cases passed** (byte-for-byte match) across both the original suite (visible to the agent) and a hidden variant suite (not visible).

```
reward = passed / total
```

Each case is scored pass/fail with a 30-second timeout. Crashes and timeouts count as failures.

## Results

| Model | Pass Rate | Passed | Total | Time |
|-------|-----------|--------|-------|------|
| Claude Opus 4.6 | 37.73% | 209 | 554 | timeout after 2 hrs |

## Running

```bash
# Sanity check with the Oracle agent (should give reward = 1.0)
harbor run -p . -k 5

# Evaluate an agent
harbor run -p . -a <agent> -m <model> -k <num_attempts>
```
