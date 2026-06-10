# Task: CommonMark Converter — Container Blocks (in C)

## Overview

Implement the subset of a [CommonMark](https://spec.commonmark.org/0.31.2/) Markdown to HTML converter **in C** that covers **container blocks — lists and block quotes**. Your converter reads Markdown from **stdin** and writes HTML to **stdout**.

This is a scoped variant of the full CommonMark task: your test corpus focuses on container-block parsing: ordered and unordered lists (with loose/tight detection, nested lists, and continuation rules) and block quotes (including lazy continuation). You must still write the parser and renderer **from scratch in C** — do not use any existing Markdown parsing library.

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

- Lists
- List items
- Block quotes

### Container blocks (the focus of this task)
- **Block quotes** (`>` prefix, including lazy continuation lines and nested quotes)
- **Ordered and unordered lists** (`-`, `+`, `*`, `1.`, `1)`) with correct **loose/tight** detection
- **List items**: the start-marker width / indentation rules that determine continuation, and items that contain paragraphs, nested lists, block quotes, and code blocks

Container blocks hold other blocks and inline content, so you will implement the paragraph + basic inline rendering needed to produce the expected HTML inside items — but the test corpus for this task focuses on the list and block-quote structure above.

### Tricky areas (common sources of failures)
- **Loose vs tight lists**: a list is loose if any of its constituent items are separated by blank lines, or if any item contains two block-level elements with a blank line between them — loose items wrap their content in `<p>`, tight items do not.
- **List-item indentation**: the continuation indent equals the width of the item start marker plus following whitespace; getting this wrong breaks every nested structure.
- **Lazy continuation**: a paragraph inside a block quote or list can continue on the next line without the `>` or indentation prefix.

## Implementation Rules

**Do not use any existing Markdown library.** This includes but is not limited to:

- Do not `#include` or link against `cmark`, `libmarkdown`, `sundown`, `hoedown`, `md4c`, `discount`, or any other Markdown parsing library
- Do not call `system()`, `popen()`, or `exec*()` to invoke `cmark`, `pandoc`, `python`, `node`, or any other external tool
- Do not write a Python or Node.js wrapper that does the real work — your converter must be a compiled C binary

Your converter must be your own from-scratch C implementation.

## Visible Test Cases

There are **73 visible test cases** in `/app/test-suite/`. Each is a JSON file with this format:

```json
{
  "example": 42,
  "section": "Lists",
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
- Visible tests: `/app/test-suite/` (73 JSON files)
- A starter `Makefile` and `md2html.c` are provided

## Time Limit

You have 2 hours. Build, test, and iterate.
