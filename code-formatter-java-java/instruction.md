Implement a deterministic Java source code formatter in Java, following the google-java-format style. Make sure the formatter is as fast as possible.

The empty formatter codebase with the Main.java entrypoint is in `formatter/`.

A directory at formatter/tests/cases/ contains formatting test cases. Each test case has:

- an input file (unformatted `.java`)
- an expected output file (the exact formatted output)

Your job is to make `java formatter.Main <input_file> <output_file>` output the formatted version of the given file exactly matching the expected outputs in the suite. The formatter should be as fast as possible across the entire provided test suite.

### Requirements

- Exact match: Output must match the expected formatted file byte-for-byte (including whitespace and newlines).

- Deterministic + idempotent: Formatting a file twice must not change it further.

- Preserve semantics: The formatted code must be behaviorally equivalent to the input (no renaming, no logic changes).

- Implement it from scratch. Do not use already built libraries like google-java-format, Eclipse JDT formatter, IntelliJ formatter, or any other formatting library. Shelling out to `google-java-format` is also not allowed.

### Formatting Rules (google-java-format defaults)

The formatter follows google-java-format's default style:

- **Indentation**: 2 spaces (no tabs)
- **Line length**: 100 characters max
- **Import ordering**: Android-style (non-static imports sorted, then static imports)
- **Wildcard imports**: Never collapse to wildcard
- **Braces**: K&R style (opening brace on same line)
- **Annotations**: One per line if multiple, inline if single and short
- **Generics**: Spaces around `<` and `>` are not used (`List<String>` not `List < String >`)
- **Method chains**: Break at each `.` if line would exceed limit
- **Lambdas**: Break long lambdas across lines; `->` on same line as params
- **Switch**: Arrow-style preferred, fall-through with colon
- **Blank lines**: 1 blank line between methods, 2 blank lines between classes
- **Comments**: Preserve all comments, Javadoc formatting
- **Trailing commas**: Not used in Java
- **String concatenation**: Break long concatenations across lines
- **Enum constants**: One per line if multiline

### Supported Syntax

The test suite covers Java 17+ syntax including:

- Classes, interfaces, enums, records, sealed classes
- Methods: definitions, overloading, overriding, varargs, generics
- Annotations: single, multiple, nested, marker, repeatable
- Generics: type parameters, wildcards, bounded types
- Lambdas: single/multi-line, method references, functional interfaces
- Streams: method chains, collectors
- Control flow: if/else, for, while, switch (traditional, enhanced, arrow), try-with-resources
- Exceptions: try/catch/finally, multi-catch
- Imports: static, wildcard, ordering
- Comments: line, block, Javadoc
- Records, sealed classes, pattern matching

### Assumptions / Simplifications

The test suite only uses a subset of Java syntax and features. Any features not present in the test cases do not need to be supported.

Focus on passing the provided suite (as many as possible).

This can be a difficult task so you can take up to 2 hours, but you need to think of the logic and implementation on your own. Give your best implementation that passes as many tests as possible.

### Entry point

Your formatter must be compilable with `gradle build` or `javac` and runnable as:

`java -cp build/classes formatter.Main path/to/input/file path/to/output/file`

It should take the input file and write the formatted code to the output file.

### How to run the suite

`bash formatter/tests/run_suite.sh`

This will print which tests pass and how fast the formatting is. Make sure to make the formatter as fast as possible.
