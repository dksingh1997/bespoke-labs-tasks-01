Implement a deterministic C source code formatter in C, following the clang-format LLVM style. Make sure the formatter is as fast as possible.

The empty formatter codebase with the main.c entrypoint is in `formatter/`.

A directory at formatter/tests/cases/ contains formatting test cases. Each test case has:

- an input file (unformatted `.c`)
- an expected output file (the exact formatted output)

Your job is to make `./formatter <input_file> <output_file>` output the formatted version of the given file exactly matching the expected outputs in the suite. The formatter should be as fast as possible across the entire provided test suite.

### Requirements

- Exact match: Output must match the expected formatted file byte-for-byte (including whitespace and newlines).

- Deterministic + idempotent: Formatting a file twice must not change it further.

- Preserve semantics: The formatted code must be behaviorally equivalent to the input (no renaming, no logic changes).

- Implement it from scratch. Do not use already built libraries like libformat, clang-format API, or any other formatting library. Shelling out to `clang-format` is also not allowed.

### Formatting Rules (clang-format LLVM style)

The formatter follows clang-format's LLVM style:

- **Indentation**: 2 spaces (no tabs)
- **Line length**: 80 characters max
- **Braces**: K&R style (opening brace on same line, closing brace on own line)
- **Spaces after keywords**: `if (`, `for (`, `while (`, `switch (`, `return `
- **No spaces inside parens**: `foo(x, y)` not `foo( x, y )`
- **Pointer alignment**: Left (`int *p` not `int* p`)
- **Reference alignment**: Left (`int &r` not `int& r`)
- **Operators**: Spaces around binary operators (`a + b`, `x == y`)
- **Commas**: No space before, one space after
- **Semicolons**: No space before, one space after in for-loops
- **Preprocessor**: Indented within #if blocks, #include sorted
- **Comments**: Preserve all comments, align trailing comments
- **Blank lines**: Collapse multiple blank lines into one
- **Struct/enum**: Each member on its own line if multiline
- **Function params**: Break long parameter lists across lines
- **Case labels**: Indented within switch (case is at same level as switch body)

### Supported Syntax

The test suite covers C99/C11 syntax including:

- Variables, arrays, pointers, structs, unions, enums, typedefs
- Functions: definitions, declarations, prototypes, variadic, inline, static
- Control flow: if/else, for, while, do-while, switch/case, goto
- Preprocessor: #include, #define, #ifdef, #pragma, #if/#elif/#else/#endif
- Expressions: arithmetic, bitwise, logical, ternary, comma, cast, sizeof
- Pointers: declaration, dereference, arithmetic, function pointers
- Structs/Unions: definitions, nested, anonymous, flexible array members
- Bitfields, alignment specifiers
- Comments: line (//), block (/* */)
- Macros: function-like, variadic, multi-line, token pasting

### Assumptions / Simplifications

The test suite only uses a subset of C syntax and features. Any features not present in the test cases do not need to be supported.

Focus on passing the provided suite (as many as possible).

This can be a difficult task so you can take up to 2 hours, but you need to think of the logic and implementation on your own. Give your best implementation that passes as many tests as possible.

### Entry point

Your formatter must be compilable with `make` in the formatter/ directory and runnable as:

`./formatter path/to/input/file path/to/output/file`

It should take the input file and write the formatted code to the output file.

### How to run the suite

`bash formatter/tests/run_suite.sh`

This will print which tests pass and how fast the formatting is. Make sure to make the formatter as fast as possible.
