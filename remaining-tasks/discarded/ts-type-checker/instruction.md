# Build a TypeScript Type Checker from Scratch

You must build a TypeScript type checker that analyzes `.ts` files and reports type errors.

## Your Task

Create an executable at **`/app/checker/tscheck`** (a script or compiled binary) that:

1. Accepts a directory path as its argument (e.g., `/app/tests/`)
2. Processes every `.ts` file in that directory
3. For each file, parses the TypeScript source, performs type checking, and outputs diagnostics to **stdout** in this format:

```
filename.ts(line,col): error TSxxxx: description
```

For example:

```
test.ts(3,5): error TS2322: Type 'string' is not assignable to type 'number'.
other.ts(10,1): error TS2304: Cannot find name 'foo'.
```

- The `filename.ts` prefix is the **basename** of the file (not the full path)
- `line` and `col` are 1-based
- `TSxxxx` is the TypeScript error code (e.g., TS2322, TS2339, TS2345)
- For files with no type errors, output nothing for that file
- Always exit with code 0 (errors are reported via stdout, not exit code)
- Each file is independent — they do not share scope or imports

## Compiler Options via Directives

Test files may contain compiler option directives at the top as comments:

```typescript
// @strict: true
// @target: es2015
```

Your checker must parse and respect these directives. The most important ones:

| Directive | Effect |
|-----------|--------|
| `@strict` | Enables all strict checks |
| `@strictNullChecks` | `null`/`undefined` are separate types (not assignable to other types) |
| `@noImplicitAny` | Error on expressions with implied `any` type |
| `@strictPropertyInitialization` | Class properties must be initialized or assigned in constructor |
| `@strictFunctionTypes` | Stricter function type compatibility |
| `@noImplicitReturns` | Error when not all code paths return a value |
| `@noUnusedLocals` | Error on unused local variables |
| `@noUnusedParameters` | Error on unused function parameters |
| `@target` | ECMAScript target version (affects available built-in types) |
| `@useDefineForClassFields` | Affects class field semantics |
| `@exactOptionalPropertyTypes` | Optional properties cannot be assigned `undefined` explicitly |

When no directives are present, use these defaults: `strict: false`, `target: es2015`.

## What You Have

- **A starter checker** at `/app/checker/tscheck` — a working Node.js script that uses `@babel/parser` to parse `.ts` files and detects **TS2304** (undefined variable references) using AST traversal and scope analysis. It handles directive parsing, output formatting, and file iteration. **Your job is to extend this checker** to detect more error types (TS2322, TS2339, TS2345, TS2554, etc.). Read the starter code — it shows the pattern for adding new checks.
- **Sample test files** in `/app/tests/` — approximately 1,600 TypeScript files, each with a corresponding `.errors` file showing the expected output. For example, `foo.ts` has `foo.errors` containing the exact error lines the TypeScript compiler reports (in the same `filename.ts(line,col): error TSxxxx: ...` format your checker should produce). Empty `.errors` files mean no errors are expected for that test.
- **TypeScript lib files** in `/app/lib/` — the standard library type definitions (`lib.es5.d.ts`, `lib.es2015.d.ts`, etc.) that define built-in types like `Array`, `Promise`, `Map`, etc. Your checker should load the appropriate lib based on the `@target` directive.
- **`@babel/parser`**, **`@babel/traverse`**, and **`@babel/types`** are pre-installed globally and available via `require('@babel/parser')` etc. No internet access is available, so you cannot install additional npm packages.
- **Node.js 20** runtime (you may implement your checker in TypeScript/JavaScript or any other available language)
- Build tools: `gcc`, `g++`, `make`, `python3`

## Evaluation

Your checker will be evaluated on a set of **hidden tests** that are separate from the sample tests. The hidden tests cover the same TypeScript features and error categories as the sample tests, but use different specific code. Your checker must also pass a small set of basic **canary tests** that cover fundamental type-checking capabilities: type mismatches in assignments/returns, undefined variable references, property access on types that lack the property, and wrong argument counts in function calls. If it fails any canary test, the score is 0.

Your checker is run as:

```bash
./tscheck <test-directory>/
```

For each test file, the output error lines are extracted (just the line numbers where errors are reported for that file) and compared against the expected error lines from the TypeScript compiler.

**A test passes** if your checker reports errors on exactly the correct set of lines for that file (no false positives, no false negatives). Error codes and messages do not need to match exactly — only the line numbers matter.

## Constraints

- You **must not** use the TypeScript compiler (`tsc`) or its Compiler API (`typescript` npm package) for type checking. You may not shell out to `tsc` or import `typescript` to perform checking.
- You **may** use the pre-installed `@babel/parser` (and `@babel/traverse`, `@babel/types`) to parse `.ts` files into an AST — the starter checker already does this. The challenge is implementing the type checker, not the parser.
- You may not tamper with the test harness, expected results, or verifier logs.

## Key Error Codes

The most common TypeScript error codes you should aim to support:

| Code | Meaning | Frequency |
|------|---------|-----------|
| TS2322 | Type 'X' is not assignable to type 'Y' | ~2,300 |
| TS2304 | Cannot find name 'X' | ~2,800 |
| TS2454 | Variable 'X' is used before being assigned | ~3,900 |
| TS2339 | Property 'X' does not exist on type 'Y' | ~700 |
| TS2345 | Argument of type 'X' is not assignable to parameter of type 'Y' | ~670 |
| TS2564 | Property 'X' has no initializer (strictPropertyInitialization) | ~1,100 |
| TS2300 | Duplicate identifier 'X' | ~400 |
| TS2430 | Interface 'X' incorrectly extends interface 'Y' | ~190 |
| TS2554 | Expected N arguments, but got M | ~190 |
| TS7006 | Parameter 'X' implicitly has an 'any' type (noImplicitAny) | ~400 |

## Approach Suggestions

1. **Read the starter checker** at `/app/checker/tscheck` — it already handles parsing, file iteration, output formatting, and TS2304 detection. Extend it rather than starting from scratch.
2. **Implement incrementally** — add one check type at a time and validate:
   - Basic assignability (TS2322): check type compatibility for assignments and return statements
   - Property access (TS2339): verify properties exist on types
   - Function calls (TS2345, TS2554): argument type and count checking
   - Variable used before assigned (TS2454): control flow analysis
3. **Validate often**: Run your checker on `/app/tests/` and diff against the `.errors` files to check your progress. For example: `./tscheck /app/tests/ | grep someTest.ts` vs `cat /app/tests/someTest.errors`.
4. **Study the test files**: Each `.ts` file paired with its `.errors` file shows exactly what input produces what errors.
5. **Use the lib files**: `/app/lib/` contains type definitions for built-in JavaScript types. Load these to type-check code that uses `Array`, `string` methods, etc.
6. **Prioritize breadth over depth**: Implement basic versions of many check types before perfecting any single one. The hidden tests cover a wide range of error categories.

You have up to 2 hours.
