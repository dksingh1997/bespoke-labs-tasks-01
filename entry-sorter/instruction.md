# Rust `ls` — Sorting

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**sort ordering**. Your implementation must be a standalone binary located at
`/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses entirely on **the order in which
entries are listed** — long format, columns, color, quoting, and recursion are
not evaluated here.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly. (`-l` may be combined in some cases purely so the sort order is visible
one-per-line; the long-format columns themselves are covered by `rust-ls-long`,
but the cases here that combine `-l` still require correct long output.)

### Sorting

| Flag | Description |
|------|-------------|
| `-S` | Sort by file size, largest first |
| `-t` | Sort by modification time, newest first |
| `-r`, `--reverse` | Reverse the sort order |
| `-U` | Do not sort — directory (readdir) order |
| `-v` | Natural / version sort |
| `-X` | Sort by extension (text after the last `.`) |
| `-f` | Do not sort; also enables `-a` and disables `-l`/color |
| `--sort=WORD` | `none` / `size` / `time` / `version` / `extension` |
| `--group-directories-first` | List directories before files, each group sorted |

### Combined in some cases

| Flag | Description |
|------|-------------|
| `-l` | Long listing (so the sorted order is shown one-per-line) |
| `-a` | Show entries starting with `.` |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects the tie-break name sort |
| `COLUMNS` | Output width (set to `80`) |
| `TZ` | Timezone (set to `UTC`) — affects time comparisons |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- The **default sort** is by name in `LC_ALL=C` (ASCII byte) order; the flags
  above change the primary sort key.
- **Ties** (equal size / equal time / equal extension) fall back to the
  byte-order name sort, matching GNU `ls`.
- Standard output is not a terminal during testing, so output is **one entry
  per line**; you do not need multi-column packing for this task.
- `-r` reverses whatever order is in effect; `-U` lists raw directory order;
  `-f` disables sorting entirely and turns on `-a`.
- `--group-directories-first` partitions into dirs-then-files, sorting within
  each partition by the active key.
- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your implementation is evaluated against a hidden suite of sorting cases over
fixtures chosen to exercise each key — varied sizes, varied timestamps, varied
extensions, version-numbered names, and a mixed directory. Each case runs your
binary and GNU `ls` on the same inputs, flags, and environment, and compares
output after trailing-whitespace normalization; they must match exactly.

## Time Limit

You have **2 hours** (7200 seconds). Get a compiling binary that lists in
default name order early, then add each sort key. When ~10 minutes remain, run
a final `cargo build --release`, copy the binary to `/app/workspace/rls`, and
make sure it runs without crashing.

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

- **Version sort (`-v`)** is the subtle one: split each name into runs of
  digits and non-digits, compare non-digit runs byte-wise and digit runs
  numerically (e.g. `file2` < `file10`, `v1.9` < `v1.10`). Study GNU's
  `filevercmp` behavior on the `versions` fixture.
- **Extension sort (`-X`)** keys on the substring after the final `.`; names
  with no extension sort first, ties broken by name.
- `-S` and `-t` are descending by default (largest/newest first); `-r` flips it.
- With `--sort=none` / `-U` / `-f`, do not reorder — emit entries in the order
  the directory yields them.
