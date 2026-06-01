# Task: Implement a Regex Engine

Build a regex matching engine from scratch in Python.

## Requirements

Create `/app/workspace/regex.py` — a program that matches a regex pattern against a string.

### Usage

```
python3 /app/workspace/regex.py <pattern> <string>
```

### Output Format

- **No match**: Print `NO_MATCH`
- **Match found**: Print `MATCH <start> <end> <matched_text>` (one line per match found by scanning left-to-right)
  - `<start>` is the 0-based index where the match begins
  - `<end>` is the 0-based index where the match ends (exclusive)
  - `<matched_text>` is the actual text that was matched

### Examples

```bash
$ python3 regex.py "hello" "say hello world"
MATCH 4 9 hello

$ python3 regex.py "a+" "xxaaabxx"
MATCH 2 5 aaa

$ python3 regex.py "[0-9]+" "no digits here"
NO_MATCH
```

### Supported Syntax

Your engine must support the regex subset described in `spec.md`. This includes literals, wildcards, character classes, quantifiers, anchors, groups, alternation, escape sequences, non-greedy quantifiers, and backreferences.

### Scoring

Your implementation will be tested against 100 patterns. Score = `correct / 100`. A test is correct if your engine produces the same match result as the reference implementation.

**Read `spec.md` carefully before implementing.**
