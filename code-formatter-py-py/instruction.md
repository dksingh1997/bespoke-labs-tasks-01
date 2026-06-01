Implement a deterministic Python code formatter in Python, following the Black formatting style. Make sure the formatter is as fast as possible.

The empty formatter codebase with the main.py entrypoint is in `formatter/`.

A directory at formatter/tests/cases/ contains formatting test cases. Each test case has:

- an input file (unformatted `.py`)
- an expected output file (the exact formatted output)

Your job is to make `python3 main.py <input_file> <output_file>` output the formatted version of the given file exactly matching the expected outputs in the suite. The formatter should be as fast as possible across the entire provided test suite.

### Requirements

- Exact match: Output must match the expected formatted file byte-for-byte (including whitespace and newlines).

- Deterministic + idempotent: Formatting a file twice must not change it further.

- Preserve semantics: The formatted code must be behaviorally equivalent to the input (no renaming, no logic changes).

- Implement it from scratch. Do not use already built libraries like black, autopep8, yapf, isort, ruff, or any other formatting/linting library. Shelling out to `black` or any other formatter is also not allowed.

### Formatting Rules (Black defaults)

The formatter follows Black's default configuration:

- **Line length**: 88 characters
- **Indentation**: 4 spaces (no tabs)
- **Quotes**: Double quotes for all strings (normalize single to double)
- **Trailing commas**: Add trailing commas in all multiline collections, function signatures, and import statements (magic trailing comma)
- **String prefix**: Lowercase string prefixes (b"...", r"...", f"...")
- **Numeric underscores**: Normalize numeric literals (remove unnecessary underscores)
- **Blank lines**: 2 blank lines before top-level definitions, 1 blank line before nested definitions
- **Imports**: Sorted within groups, one per line for multiline
- **Operators**: Spaces around binary operators
- **Brackets**: Closing bracket on its own line for multiline expressions
- **Docstrings**: Preserve content, normalize quotes
- **Comments**: Preserve all comments, normalize spacing after `#`
- **f-strings**: Do not modify f-string internals
- **Parentheses**: Remove unnecessary parentheses around expressions

### Supported Syntax

The test suite covers Python 3.10+ syntax including:

- Imports, from-imports, aliases
- Function definitions, decorators, default args, *args/**kwargs, async
- Class definitions, inheritance, methods, properties, dataclasses
- Control flow: if/elif/else, for, while, try/except/finally, with, match/case
- Comprehensions: list, dict, set, generator, nested
- Strings: single/double quotes, f-strings, triple-quoted, raw, byte
- Type hints: annotations, unions (X | Y), generics, Protocol, TypeVar
- Data structures: lists, dicts, sets, tuples, nested
- Operators: arithmetic, comparison, boolean, walrus, matrix multiply
- Comments: inline, docstrings, type: ignore, noqa

### Assumptions / Simplifications

The test suite only uses a subset of Python syntax and features. Any features not present in the test cases do not need to be supported.

Focus on passing the provided suite (as many as possible).

This can be a difficult task so you can take up to 2 hours, but you need to think of the logic and implementation on your own. Give your best implementation that passes as many tests as possible.

### Entry point

Your formatter must be runnable as:

`python3 main.py path/to/input/file path/to/output/file`

It should take the input file and write the formatted code to the output file.

### How to run the suite

`bash formatter/tests/run_suite.sh`

This will print which tests pass and how fast the formatting is. Make sure to make the formatter as fast as possible.
