# sed-from-scratch

Implement a clone of GNU `sed` (stream editor) in C from scratch.

- **Language**: C
- **Difficulty**: Hard
- **Category**: systems-programming
- **Oracle**: GNU `/usr/bin/sed` (via wrapper; anti-gaming disabled for oracle)

## Test Suite

Tests come from two sources:
1. **GNU sed's own test suite** — 42 test cases (`.sed`/`.inp`/`.good` triplets) from the official GNU sed repository, covering basic commands through complete programs written in sed (prime factorizer, RPN calculator, binary calculator).
2. **Custom CLI tests** — 12 tests for command-line features (in-place editing, `-e`/`-f` flags, branching, etc.)

Total: **54 tests** across 7 tiers.

## Scoring

| Tier | Name | Weight | Tests | Source |
|------|------|--------|-------|--------|
| T1 | Basic Commands | 0.06 | 12 | GNU + custom |
| T2 | Addressing & Escaping | 0.08 | 10 | GNU + custom |
| T3 | Substitution Features | 0.12 | 11 | GNU + custom |
| T4 | Hold Space & Recall | 0.14 | 8 | GNU + custom |
| T5 | Complex Scripts | 0.16 | 7 | GNU + custom |
| T6 | Programs (factor, dc) | 0.20 | 4 | GNU + custom |
| T7 | Binary Calculator | 0.24 | 3 | GNU |

`factor.sed` implements prime factorization in pure sed (77 lines).
`dc.sed` implements an arbitrary-precision RPN calculator (322 lines).
`binary*.sed` implement binary calculators (~200 lines each).

These are not tests of the agent's sed *code* — they are programs that run *on* the agent's sed implementation, stressing branching, labels, hold space, and multi-line processing simultaneously.

## Anti-gaming

Source analysis checks for: calls to real sed, `system()`, `popen()`, minimum code size.
Oracle bypass via `.oracle_marker` file written by `solution/solve.sh`.
