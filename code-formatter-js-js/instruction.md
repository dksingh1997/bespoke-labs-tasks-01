Implement a deterministic JavaScript/TypeScript code formatter in JavaScript (Node.js), following the Prettier default formatting style. Make sure the formatter is as fast as possible.

The empty formatter codebase with the main.js entrypoint is in `formatter/`.

A directory at formatter/tests/cases/ contains formatting test cases. Each test case has:

- an input file (unformatted `.js` or `.ts`)
- an expected output file (the exact formatted output)

Your job is to make `node main.js <input_file> <output_file>` output the formatted version of the given file exactly matching the expected outputs in the suite. The formatter should be as fast as possible across the entire provided test suite.

### Requirements

- Exact match: Output must match the expected formatted file byte-for-byte (including whitespace and newlines).

- Deterministic + idempotent: Formatting a file twice must not change it further.

- Preserve semantics: The formatted code must be behaviorally equivalent to the input (no renaming, no logic changes).

- Implement it from scratch. Do not use already built libraries like prettier, eslint, biome, dprint etc. in any way (installing, calling them as API or tools is not allowed.)

### Formatting Rules (Prettier defaults)

The formatter follows Prettier's default configuration:

- **Print width**: 80 characters
- **Tab width**: 2 spaces (no tabs)
- **Semicolons**: Always add semicolons at the end of statements
- **Quotes**: Double quotes for strings
- **Trailing commas**: Add trailing commas wherever valid in ES5+ (objects, arrays, parameters, etc.)
- **Bracket spacing**: Spaces inside object literal braces `{ foo: bar }`
- **Arrow function parens**: Always include parentheses `(x) => x`
- **Single attribute per line**: No (keep multiple JSX attributes on one line if they fit)
- **End of line**: Line feed (`\n`)

### Supported Syntax

The test suite covers both JavaScript and TypeScript syntax including:

- Variables, assignments, destructuring
- Functions (declarations, expressions, arrow functions, generators, async)
- Classes (fields, methods, static blocks, private fields, decorators)
- Control flow (if/else, for, while, do-while, switch, try/catch)
- Modules (import/export, dynamic import)
- Expressions (binary, unary, ternary, optional chaining, nullish coalescing)
- Template literals
- JSX elements and fragments
- TypeScript types (interfaces, enums, type aliases, generics, mapped types, conditional types, tuples, unions, intersections)
- Comments (line and block)

### Assumptions / Simplifications

The test suite only uses a subset of JavaScript/TypeScript syntax and features. Any features not present in the test cases do not need to be supported.

Focus on passing the provided suite (as many as possible).

This can be a difficult task so you can take up to 2 hours, but you need to think of the logic and implementation on your own. Give your best implementation that passes as many tests as possible.

### Entry point

Your formatter must be runnable as:

`node main.js path/to/input/file path/to/output/file`

It should take the input file and write the formatted code to the output file. The formatter should auto-detect the language (JavaScript vs TypeScript) based on the file extension.

### How to run the suite

`bash formatter/tests/run_suite.sh`

This will print which tests pass and how fast the formatting is. Make sure to make the formatter as fast as possible.
