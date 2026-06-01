Implement a deterministic Go source code formatter in Go, following the gofmt formatting style. Make sure the formatter is as fast as possible.

The empty formatter codebase with the main.go entrypoint is in `formatter/`.

A directory at formatter/tests/cases/ contains formatting test cases. Each test case has:

- an input file (unformatted `.go`)
- an expected output file (the exact formatted output)

Your job is to make `go run main.go <input_file> <output_file>` output the formatted version of the given file exactly matching the expected outputs in the suite. The formatter should be as fast as possible across the entire provided test suite.

### Requirements

- Exact match: Output must match the expected formatted file byte-for-byte (including whitespace and newlines).

- Deterministic + idempotent: Formatting a file twice must not change it further.

- Preserve semantics: The formatted code must be behaviorally equivalent to the input (no renaming, no logic changes).

- Implement it from scratch. Do not use already built libraries like go/format, go/printer, gofmt, or any other formatting package. Writing the input file and shelling out to `gofmt` is also not allowed.

### Formatting Rules (gofmt defaults)

The formatter follows gofmt's formatting conventions:

- **Indentation**: Tabs (not spaces)
- **Line length**: No hard limit, but break long lines sensibly
- **Semicolons**: Automatically inserted at end of statements (after final token on line)
- **Operators**: Spaces around binary operators (`a + b`, `x == y`)
- **Commas**: No space before comma, one space after
- **Braces**: Opening brace on same line (K&R style for functions, control flow)
- **Blank lines**: Collapse multiple blank lines into one; single blank line between functions
- **Alignment**: Align consecutive assignment/declaration groups, struct fields, and comments
- **Comments**: Preserve all comments in their logical position; doc comments separated by blank line
- **Trailing commas**: Required in multiline composite literals
- **Parentheses**: Remove unnecessary parentheses around expressions

### Supported Syntax

The test suite covers Go syntax including:

- Variables (`var`, `:=`), constants, type declarations, functions, methods
- Control flow: if/else, for (all forms), switch (expression, type), select, range
- Data literals: structs, arrays, slices, maps, composite literals, nested literals
- Interfaces: method sets, type constraints, embedded interfaces, generic constraints
- Goroutines/channels: go, chan, buffered/unbuffered, select with cases
- Error handling: defer, panic, recover
- Generics: type parameters, constraints, instantiation, method type params
- Comments: line, block, doc comments, comment groups

### Assumptions / Simplifications

The test suite only uses a subset of Go syntax and features. Any features not present in the test cases do not need to be supported.

Focus on passing the provided suite (as many as possible).

This can be a difficult task so you can take up to 2 hours, but you need to think of the logic and implementation on your own. Give your best implementation that passes as many tests as possible.

### Entry point

Your formatter must be runnable as:

`go run main.go path/to/input/file path/to/output/file`

It should take the input file and write the formatted code to the output file.

### How to run the suite

`bash formatter/tests/run_suite.sh`

This will print which tests pass and how fast the formatting is. Make sure to make the formatter as fast as possible.
