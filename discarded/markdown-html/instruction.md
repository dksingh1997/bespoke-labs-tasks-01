# Task: CommonMark Markdown to HTML Converter (in C)

## Overview

Implement a [CommonMark](https://spec.commonmark.org/0.31.2/) Markdown to HTML converter **in C**. Your converter reads Markdown from **stdin** and writes HTML to **stdout**.

You must write the entire parser and HTML renderer from scratch in C. Do not use any existing Markdown parsing library.

## Compilation

Your code must compile with `make` in `/app/workspace/`. A starter `Makefile` is provided. You may add more `.c` and `.h` files and update the Makefile as needed. The verifier will run:

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

Your converter must handle the full CommonMark specification. The major areas are:

### Block-level structures
- **Thematic breaks** (`---`, `***`, `___`)
- **ATX headings** (`# H1` through `###### H6`) and **setext headings** (underlined with `=` or `-`)
- **Indented code blocks** (4-space indent) and **fenced code blocks** (`` ``` `` or `~~~` with optional info string)
- **Block quotes** (`>` prefix, including lazy continuation lines)
- **Ordered and unordered lists** (with correct loose/tight detection, nested lists, and continuation rules)
- **HTML blocks** (7 types: `<pre>`, `<script>`, `<!-- -->`, `<?`, `<!`, CDATA, and general block-level tags)
- **Link reference definitions** (`[label]: url "title"`)
- **Paragraphs** and **blank lines**

### Inline-level structures
- **Code spans** (backtick strings)
- **Emphasis and strong emphasis** (`*`, `_` with correct left/right flanking delimiter rules)
- **Links** `[text](url "title")` and **images** `![alt](url "title")`
- **Reference links** `[text][label]`, `[text][]`, `[text]`
- **Autolinks** (`<http://example.com>`, `<foo@bar.com>`)
- **Raw HTML** (inline tags)
- **Hard line breaks** (trailing `  ` or `\`) and **soft line breaks**
- **Backslash escapes** and **character references** (`&amp;`, `&#1234;`, `&#x1A;`)

### Tricky areas (common sources of failures)
- **Tabs**: CommonMark treats tabs as expanding to the next tab stop (columns 1, 5, 9, ...). Tab handling inside list items and code blocks is particularly tricky.
- **Lazy continuation**: A paragraph inside a block quote or list can continue on the next line without the `>` or indentation prefix.
- **Emphasis precedence**: The rules for which delimiter closes which are complex — review the spec carefully, particularly the "multiple of 3" rule.
- **Nested lists**: List items can contain other lists, block quotes, code blocks, and paragraphs. The indentation rules for continuation are subtle.
- **Link destinations**: Can be enclosed in `<...>` or bare (with balanced parentheses).
- **Entity references**: Must handle named entities (`&amp;`), decimal (`&#1234;`), and hex (`&#xAB;`).

## Anti-Cheat

**Do not use any existing Markdown library.** This includes but is not limited to:

- Do not `#include` or link against `cmark`, `libmarkdown`, `sundown`, `hoedown`, `md4c`, `discount`, or any other Markdown parsing library
- Do not call `system()`, `popen()`, or `exec*()` to invoke `cmark`, `pandoc`, `python`, `node`, or any other external tool
- Do not write a Python or Node.js wrapper that does the real work — your converter must be a compiled C binary

Violations result in a score of 0.

## Visible Test Cases

There are **458 visible test cases** in `/app/test-suite/`. Each is a JSON file with this format:

```json
{
  "example": 42,
  "section": "ATX headings",
  "markdown": "# foo\n",
  "html": "<h1>foo</h1>\n"
}
```

Use them to test your implementation during development:

```bash
# Run a single test
MD=$(python3 -c "import json; print(json.load(open('/app/test-suite/test_001.json'))['markdown'], end='')")
EXPECTED=$(python3 -c "import json; print(json.load(open('/app/test-suite/test_001.json'))['html'], end='')")
ACTUAL=$(echo -n "$MD" | ./md2html)
if [ "$ACTUAL" = "$EXPECTED" ]; then echo "PASS"; else echo "FAIL"; fi

# Run all visible tests
pass=0; fail=0
for f in /app/test-suite/test_*.json; do
  md=$(python3 -c "import json,sys; print(json.load(open('$f'))['markdown'], end='')")
  expected=$(python3 -c "import json,sys; print(json.load(open('$f'))['html'], end='')")
  actual=$(echo -n "$md" | timeout 5 ./md2html 2>/dev/null)
  if [ "$actual" = "$expected" ]; then pass=$((pass+1)); else fail=$((fail+1)); fi
done
echo "Passed: $pass / $((pass+fail))"
```

## Scoring

Your score is a weighted composite:

| Category | Weight | How it's scored |
|----------|--------|-----------------|
| **Correctness** | 50% | Fraction of tests (visible + hidden = 655 total) that produce exactly matching HTML output |
| **Performance** | 50% | Speed of your converter vs. a reference C implementation on large documents. Per benchmark: `min(1.0, (ref_time * 5) / your_time)` — you can be up to 5x slower for full marks |

A converter that passes all correctness tests but is extremely slow will cap around 0.50. Performance is equally weighted — you must write efficient C code. Avoid O(n^2) patterns like repeated string concatenation, repeated `realloc` on every character, or linear scans through the entire document for every line.

### Performance Tips

- Use a dynamic buffer (realloc-based) for output instead of fixed-size arrays
- Process the document in a single pass where possible (two-pass is fine: one for block structure, one for inlines)
- Avoid unnecessary copying — work with pointers into the original input buffer
- Hash-based or sorted lookup for entity references rather than linear scan

## Workspace

- Your workspace: `/app/workspace/`
- Visible tests: `/app/test-suite/` (458 JSON files)
- A starter `Makefile` and `md2html.c` are provided

## Time Limit

You have 2 hours. Build, test, and iterate.
