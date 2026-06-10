# Rust `ls` — Basic Listing

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**basic listing** behavior. Your implementation must be a standalone binary
located at `/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses entirely on **plain directory
listing and dotfile filtering** — long format, sorting flags, columns, color,
quoting, recursion, and the other feature families are not evaluated here.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

| Flag | Description |
|------|-------------|
| `-1` | One entry per line |
| `-a`, `--all` | Show entries starting with `.` (including `.` and `..`) |
| `-A`, `--almost-all` | Like `-a` but omit `.` and `..` |

## Environment Variables

Your implementation must respect:

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` during testing — affects sort order |
| `COLUMNS` | Output width (set to `80` during testing) |
| `TERM` | Terminal type (set to `xterm-256color`) |

## Output Behavior

- **Default ordering**: entries are sorted by name in `LC_ALL=C` (ASCII byte)
  order.
- **Standard output is not a terminal** during testing, so the default format
  is **one entry per line** (the same as `-1`). You do not need to implement
  multi-column packing for this task.
- **No arguments**: list the current directory.
- **Directory arguments**: list that directory's entries.
- **Hidden entries**: by default, names beginning with `.` are omitted; `-a`
  includes them (with `.` and `..`), `-A` includes them (without `.`/`..`).
- **Exit code**: 0 on success, non-zero on error (e.g. nonexistent path).

## Evaluation

Your implementation is evaluated against a hidden suite of basic-listing cases
over several fixture directories (ordinary files, dotfiles, an empty directory,
a directory with many entries, and a mixed directory), each run with no flags,
`-1`, `-a`, `-A`, and their combinations. Each case runs your binary and GNU
`ls` on the same inputs, flags, and environment, and compares their output after
trailing-whitespace normalization on each line; they must match exactly.

## Time Limit

You have **2 hours** (7200 seconds). After that the environment is terminated
and whatever binary exists at `/app/workspace/rls` is evaluated.

**Strategy**: this is the foundational tier — get a compiling binary that lists
a directory one entry per line in `C` sort order early, then add `-a`/`-A`
filtering. When ~10 minutes remain, run a final `cargo build --release`, copy
the binary to `/app/workspace/rls`, and make sure it runs without crashing.

## Constraints

- You must implement this in **Rust**.
- You may **not** use the `uutils` crate or any crate that provides a
  ready-made `ls` implementation.
- You may use standard library crates and general-purpose crates (e.g. `libc`,
  `nix`, `clap`).
- Your final binary must be at `/app/workspace/rls`.
- The system `ls` command is disabled in the environment — do not attempt to
  call it.
- Each test has a per-case timeout (10 seconds).

## Getting Started

Example fixtures are in `/app/workspace/examples/`:
- `basic/` — a simple directory with text files and subdirectories
- `expected/` — expected outputs for a few basic-listing cases

```bash
diff <(/app/workspace/rls    /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t1_basic_no_flags.txt

diff <(/app/workspace/rls -a /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t1_basic_all.txt
```

Test fixtures are in `/app/fixtures/` and test definitions in `/app/tests/`.

## Tips

- The test environment uses `LC_ALL=C` — sort by raw bytes, not locale rules
  (uppercase sorts before lowercase).
- GNU `ls` sorting ignores a leading `.` only for hidden files in some sort
  modes; for the default name sort, compare the full names byte-for-byte after
  the hidden-filter is applied.
- `-A` is exactly `-a` minus the `.` and `..` entries.
