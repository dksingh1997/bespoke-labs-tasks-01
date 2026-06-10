# Rust `ls` — Column & Output Formatting

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**output layout** — multi-column, across, and comma-separated formats. Your
implementation must be a standalone binary located at `/app/workspace/rls`. It
will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses entirely on **how entries are
packed into the available width** — long format, sorting, color, quoting, and
recursion are not evaluated here.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

| Flag | Description |
|------|-------------|
| `-C` | Multi-column output, entries sorted **down columns** (vertical) |
| `-x` | Multi-column output, entries sorted **across rows** (horizontal) |
| `-m` | Comma-separated, filled to the line width |
| `-1` | One entry per line |
| `-w COLS`, `--width=COLS` | Set output width (overrides `COLUMNS`) |
| `-T COLS`, `--tabsize=COLS` | Tab stop width (default 8) |
| `--format=WORD` | `across` / `commas` / `single-column` / `vertical` (and `long`/`verbose`, which select long format) |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order |
| `COLUMNS` | Output width (set to `80`); used when `-w`/`--width` is absent |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- Entries are name-sorted (`LC_ALL=C`) first, then packed into the layout.
- **`-C` (vertical)**: GNU `ls` chooses the **maximum number of columns** that
  fit in the width; entries run **down** each column, with column count and
  per-column widths computed so the longest entry in each column plus padding
  fits. Column separation is **2 spaces**; the layout is right-padded with
  spaces (trailing whitespace is normalized away before comparison).
- **`-x` (across)**: same column sizing, but entries run **left-to-right** along
  each row before wrapping.
- **`-m`**: entries joined by `, `, wrapped so each output line stays within the
  width.
- **Width source**: `-w`/`--width` takes precedence over `COLUMNS`; `0` means
  unlimited (single line where applicable).
- Note that standard output is not a terminal during testing, so the *default*
  (no format flag) is one-per-line — these flags explicitly request the
  multi-column layouts.
- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your implementation is evaluated against a hidden suite of formatting cases over
fixtures with varied name lengths and entry counts, at several widths
(`-w 40`, `-w 60`, `-w 120`) and tab sizes. Each case runs your binary and GNU
`ls` on the same inputs, flags, and environment, and compares output after
trailing-whitespace normalization on each line; they must match exactly. The
hardest part is reproducing GNU's exact column-count and column-width algorithm.

## Time Limit

You have **2 hours** (7200 seconds). Get single-column output working, then
implement the vertical (`-C`) column-fitting algorithm, then `-x` and `-m`.
When ~10 minutes remain, run a final `cargo build --release`, copy the binary to
`/app/workspace/rls`, and make sure it runs without crashing.

## Constraints

- You must implement this in **Rust**.
- You may **not** use the `uutils` crate or any crate that provides a
  ready-made `ls` implementation.
- You may use standard library crates and general-purpose crates (e.g. `libc`,
  `nix`, `clap`).
- Your final binary must be at `/app/workspace/rls`.
- The system `ls` command is disabled — do not attempt to call it.
- Each test has a per-case timeout (10 seconds).

## Getting Started

Example fixtures are in `/app/workspace/examples/`. Test fixtures are in
`/app/fixtures/` and test definitions in `/app/tests/`.

## Tips

- GNU's vertical algorithm: try the **largest** column count that fits, compute
  each column's width as (max entry width in that column + 2), and accept the
  largest count whose total width ≤ the line width. Entries are assigned to
  columns top-to-bottom (`-C`) — i.e. `rows = ceil(n / cols)` and entry `i` goes
  to `column = i / rows`.
- For `-x`, the same column widths are used but entry `i` goes to
  `column = i % cols`.
- Inter-column gap is **2 spaces**; the final column is not padded (trailing
  whitespace is stripped during scoring, so don't worry about exact trailing
  pad).
- Read width from `-w`/`--width` if present, else `COLUMNS`, else 80.
