# Rust `ls` — Quoting & Escaping

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**name quoting and escaping**. Your implementation must be a standalone binary
located at `/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses entirely on **how filenames
containing spaces, quotes, tabs, newlines, backslashes, and control characters
are rendered** — long format, sorting, columns, color, and recursion are not the
focus here (entries are still name-sorted).

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

| Flag | Description |
|------|-------------|
| `-b`, `--escape` | Print C-style escapes (`\t`, `\n`, `\\`, `\NNN`, …) for non-graphic chars |
| `-q`, `--hide-control-chars` | Print `?` for each non-graphic char |
| `-Q`, `--quote-name` | Enclose names in double quotes |
| `-N`, `--literal` | Print raw names with no quoting or escaping |
| `--show-control-chars` | Show non-graphic chars as-is (the opposite of `-q`) |
| `--quoting-style=WORD` | `literal` / `shell` / `shell-always` / `shell-escape` / `shell-escape-always` / `c` / `escape` |

### Combined in some cases

| Flag | Description |
|------|-------------|
| `-l` | Long listing (cases that use it require correct long output) |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order and which bytes count as printable |
| `COLUMNS` | Output width (set to `80`) |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

The default quoting style for GNU `ls` is **`shell-escape`** when output is not
a terminal in recent coreutils — however, the test environment pins behavior via
flags, so implement each named style precisely:

- **`literal`** (`-N`): emit the raw bytes, no quoting.
- **`shell`**: quote with single quotes only when needed (spaces, shell
  metacharacters); otherwise bare.
- **`shell-always`**: always single-quote.
- **`shell-escape`** / **`shell-escape-always`**: like shell/shell-always but
  use `$'…'` ANSI-C quoting for names containing control characters.
- **`c`** (also `-Q`): double-quote the name and apply C escapes (`\t`, `\n`,
  `\"`, `\\`, octal `\NNN`).
- **`escape`** (`-b`): C-style escapes **without** the surrounding quotes.
- **`-q`** replaces every non-graphic character with `?` (independent of style).
- **`--show-control-chars`** turns off the `-q` default substitution.

When several of these are combined, GNU `ls` applies a defined precedence —
reproduce it so the exact byte output matches.

- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your implementation is evaluated against a hidden suite built on a fixture of
filenames containing spaces, single/double quotes, tabs, backslashes, embedded
control characters, and a newline, plus a few ordinary fixtures. Each case runs
your binary and GNU `ls` on the same inputs, flags, and environment, and
compares output after trailing-whitespace normalization on each line; they must
match exactly.

## Time Limit

You have **2 hours** (7200 seconds). Implement `literal` first, then the `c`/
`escape` styles, then the `shell*` family, then the `-q` substitution. When ~10
minutes remain, run a final `cargo build --release`, copy the binary to
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

- Work at the **byte** level, not UTF-8 — filenames are arbitrary byte strings,
  and under `LC_ALL=C` any byte outside the printable ASCII range (0x20–0x7E)
  is "non-graphic" and subject to escaping/`?` substitution.
- For the **`c`** style: wrap in double quotes and escape `"` and `\`, map
  `\t \n \r` etc. to their backslash forms, and emit remaining non-printables
  as 3-digit octal `\NNN`.
- For **`shell`**: a name needs quoting if it is empty or contains any of the
  shell-special characters (space, `'"\$\`&|;<>()*?[]#~=%!{}` and control
  chars); single-quote it, and for embedded single quotes use the
  `'\''` splice.
- Map the short flags onto styles: `-N`→literal, `-Q`→c, `-b`→escape; the last
  quoting-related flag on the command line wins, mirroring GNU precedence.
