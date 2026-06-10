# Task: CommonMark Converter — Leaf Blocks (in C)

## Overview

Implement the subset of a [CommonMark](https://spec.commonmark.org/0.31.2/) Markdown to HTML converter **in C** that covers **leaf blocks — headings, code blocks, HTML blocks, and thematic breaks**. Your converter reads Markdown from **stdin** and writes HTML to **stdout**.

This is a scoped variant of the full CommonMark task: your test corpus focuses on leaf-block parsing: ATX and setext headings, thematic breaks, indented and fenced code blocks, HTML blocks, paragraphs, blank lines, and tab expansion. You must still write the parser and renderer **from scratch in C** — do not use any existing Markdown parsing library.

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

- ATX headings
- Setext headings
- Thematic breaks
- Indented code blocks
- Fenced code blocks
- HTML blocks
- Paragraphs
- Tabs
- Blank lines

### Leaf blocks (the focus of this task)
- **Thematic breaks** (`---`, `***`, `___`)
- **ATX headings** (`# H1` through `###### H6`) and **setext headings** (underlined with `=` or `-`)
- **Indented code blocks** (4-space indent) and **fenced code blocks** (`` ``` `` or `~~~` with optional info string)
- **HTML blocks** (all 7 types: `<pre>`/`<script>`/`<style>`, `<!-- -->`, `<?`, `<!`, CDATA, and general block-level tags)
- **Paragraphs**, **blank lines**, and **tab expansion**

You will implement the paragraph + basic inline rendering needed to produce the expected HTML for headings and paragraphs, but the test corpus for this task focuses on the leaf-block structure above.

### Tricky areas (common sources of failures)
- **Tabs**: CommonMark expands tabs to the next tab stop (columns 1, 5, 9, ...). Tab handling at the start of a line (and inside code blocks) is particularly tricky.
- **HTML blocks**: the 7 start/end conditions differ; type 7 (general tags) cannot interrupt a paragraph.
- **Fenced code**: the closing fence must be at least as long as the opening one and of the same character; the info string's first word becomes the `language-` class.
- **Setext vs thematic break vs list**: a line of `-` can be a setext underline, a thematic break, or a list item depending on context.

## Implementation Rules

**Do not use any existing Markdown library.** This includes but is not limited to:

- Do not `#include` or link against `cmark`, `libmarkdown`, `sundown`, `hoedown`, `md4c`, `discount`, or any other Markdown parsing library
- Do not call `system()`, `popen()`, or `exec*()` to invoke `cmark`, `pandoc`, `python`, `node`, or any other external tool
- Do not write a Python or Node.js wrapper that does the real work — your converter must be a compiled C binary

Your converter must be your own from-scratch C implementation.

## Visible Test Cases

There are **117 visible test cases** in `/app/test-suite/`. Each is a JSON file with this format:

```json
{
  "example": 42,
  "section": "ATX headings",
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
- Visible tests: `/app/test-suite/` (117 JSON files)
- A starter `Makefile` and `md2html.c` are provided

## Time Limit

You have 2 hours. Build, test, and iterate.
