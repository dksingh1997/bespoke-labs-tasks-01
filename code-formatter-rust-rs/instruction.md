Implement a deterministic Rust source code formatter in Rust, following the rustfmt formatting style. Make sure the formatter is as fast as possible.

The empty formatter codebase with the main.rs entrypoint is in `formatter/`.

A directory at formatter/tests/cases/ contains formatting test cases. Each test case has:

- an input file (unformatted `.rs`)
- an expected output file (the exact formatted output)

Your job is to make `cargo run --manifest-path formatter/Cargo.toml -- <input_file> <output_file>` output the formatted version of the given file exactly matching the expected outputs in the suite. The formatter should be as fast as possible across the entire provided test suite.

### Requirements

- Exact match: Output must match the expected formatted file byte-for-byte (including whitespace and newlines).

- Deterministic + idempotent: Formatting a file twice must not change it further.

- Preserve semantics: The formatted code must be behaviorally equivalent to the input (no renaming, no logic changes).

- Implement it from scratch. Do not use already built libraries like rustfmt, syn, prettyplease, or any other formatting/parsing crate. Shelling out to `rustfmt` is also not allowed.

### Formatting Rules (rustfmt defaults)

The formatter follows rustfmt's default configuration:

- **Indentation**: 4 spaces
- **Line length**: 100 characters max
- **Braces**: Opening brace on same line
- **Trailing commas**: Always in multiline contexts
- **Imports**: Grouped and sorted (`use` statements)
- **Operators**: Spaces around binary operators
- **Commas**: No space before, one space after
- **Comments**: Preserve all comments; align doc comments
- **Attributes**: One per line if long, inline if short
- **Match arms**: One per line, body indented
- **Closures**: Break long closures across lines
- **Method chains**: Break at each `.` if line would exceed limit
- **Generics**: Break long generic parameter lists
- **Where clauses**: Each bound on its own line if multiline

### Supported Syntax

The test suite covers Rust syntax including:

- Variables, bindings, destructuring, type annotations
- Functions, closures, async, unsafe, extern
- Structs, enums, tuple structs, unit structs, derive macros
- Traits, implementations, associated types, trait objects
- Generics, where clauses, lifetime parameters, const generics
- Pattern matching: match, if let, while let
- Macros: macro_rules!, derive macros, function-like macros
- Modules, use statements, visibility modifiers
- Error handling: Result, Option, ?
- Strings: format!, println!, raw strings
- Collections, iterators, method chains
- Attributes, doc comments

### Assumptions / Simplifications

The test suite only uses a subset of Rust syntax and features. Any features not present in the test cases do not need to be supported.

Focus on passing the provided suite (as many as possible).

This can be a difficult task so you can take up to 2 hours, but you need to think of the logic and implementation on your own. Give your best implementation that passes as many tests as possible.

### Entry point

Your formatter must be runnable as:

`cargo run --manifest-path formatter/Cargo.toml -- path/to/input/file path/to/output/file`

It should take the input file and write the formatted code to the output file.

### How to run the suite

`bash formatter/tests/run_suite.sh`

This will print which tests pass and how fast the formatting is. Make sure to make the formatter as fast as possible.
