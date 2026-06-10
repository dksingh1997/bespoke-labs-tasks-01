# Task: CommonMark Converter — Inline-Level Commonmark Constructs (in C)

## Overview

Implement the subset of a [CommonMark](https://spec.commonmark.org/0.31.2/) Markdown to HTML converter **in C** that covers **inline-level CommonMark constructs**. Your converter reads Markdown from **stdin** and writes HTML to **stdout**.

This is a scoped variant of the full CommonMark task: your test corpus focuses on inline rendering: emphasis/strong, code spans, links and images (inline and reference), autolinks, raw inline HTML, entity & numeric character references, backslash escapes, and hard/soft line breaks. You must still write the parser and renderer **from scratch in C** — do not use any existing Markdown parsing library.

## Compilation

Your code must compile with `make` in `/app/workspace/`. A starter `Makefile` is provided. You may add more `.c` and `.h` files and update the Makefile as needed. Your code will be built with:

```bash
make -C /app/workspace
```

If that fails, it will fall back to:

```bash
gcc -O2 -Wall -std=c11 -o /app/workspace/md2html /app/workspace/*.c -lm
```

The result must be an executable at `/app/workspace/md2html`.

## Interface

```bash
echo "# Hello" | /app/workspace/md2html
```

Your program reads all of stdin and writes the converted HTML to stdout. No command-line flags are required.

## What You Must Implement

This task is scoped to the following CommonMark sections:

- Emphasis and strong emphasis
- Code spans
- Links
- Images
- Link reference definitions
- Autolinks
- Raw HTML
- Entity and numeric character references
- Backslash escapes
- Hard line breaks
- Soft line breaks
- Precedence
- Inlines
- Textual content

### Inline-level structures (the focus of this task)
- **Code spans** (backtick strings, with correct backtick-run matching)
- **Emphasis and strong emphasis** (`*`, `_` with the left/right flanking delimiter rules and the "multiple of 3" rule)
- **Links** `[text](url "title")` and **images** `![alt](url "title")`
- **Reference links** `[text][label]`, `[text][]`, `[text]`, and **link reference definitions** (`[label]: url "title"`)
- **Autolinks** (`<http://example.com>`, `<foo@bar.com>`)
- **Raw HTML** (inline tags)
- **Hard line breaks** (trailing `  ` or `\`) and **soft line breaks**
- **Backslash escapes** and **character references** (`&amp;`, `&#1234;`, `&#x1A;`)

You still need enough paragraph/block scaffolding to wrap inline content in `<p>` and to parse link reference definitions, but the test corpus for this task focuses on the inline constructs above.

### Tricky areas (common sources of failures)
- **Emphasis precedence**: which delimiter closes which is genuinely hard — review the spec, especially the "multiple of 3" rule and left/right-flanking definitions.
- **Link destinations**: can be enclosed in `<...>` or bare (with balanced parentheses); titles may use `"`, `'`, or `(...)`.
- **Entity references**: named (`&amp;`), decimal (`&#1234;`), and hex (`&#xAB;`).
- **Code span normalization**: line endings become spaces; a single leading+trailing space is stripped when the content is not all spaces.

## Implementation Rules

**Do not use any existing Markdown library.** This includes but is not limited to:

- Do not `#include` or link against `cmark`, `libmarkdown`, `sundown`, `hoedown`, `md4c`, `discount`, or any other Markdown parsing library
- Do not call `system()`, `popen()`, or `exec*()` to invoke `cmark`, `pandoc`, `python`, `node`, or any other external tool
- Do not write a Python or Node.js wrapper that does the real work — your converter must be a compiled C binary

Your converter must be your own from-scratch C implementation.

## Visible Test Cases

There are **268 visible test cases** in `/app/test-suite/`. Each is a JSON file with this format:

```json
{
  "example": 42,
  "section": "Emphasis and strong emphasis",
  "markdown": "...",
  "html": "..."
}
```

Use them to test your implementation during development:

```bash
# Run all visible tests
pass=0; fail=0
for f in /app/test-suite/test_*.json; do
  md=$(python3 -c "import json; print(json.load(open('$f'))['markdown'], end='')")
  expected=$(python3 -c "import json; print(json.load(open('$f'))['html'], end='')")
  actual=$(echo -n "$md" | timeout 5 ./md2html 2>/dev/null)
  if [ "$actual" = "$expected" ]; then pass=$((pass+1)); else fail=$((fail+1)); fi
done
echo "Passed: $pass / $((pass+fail))"
```

## Goals

Your converter should be both correct and fast:

- **Correct** — your HTML output must exactly match the CommonMark reference output, on the visible cases above and on additional held-out inputs covering the same sections.
- **Fast** — it must handle large documents quickly, comparable to a production-quality C parser.

Aim for clean, efficient C. Avoid O(n^2) patterns like repeated string concatenation, repeated `realloc` on every character, or linear scans through the entire document for every line.

## Workspace

- Your workspace: `/app/workspace/`
- Visible tests: `/app/test-suite/` (268 JSON files)
- A starter `Makefile` and `md2html.c` are provided

## Time Limit

You have 2 hours. Build, test, and iterate.
