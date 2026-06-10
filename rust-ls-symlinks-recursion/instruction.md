# Rust `ls` — Symlinks, Indicators & Recursion

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
behavior for **symbolic links, type indicators, recursion, and multi-argument
invocations**. Your implementation must be a standalone binary located at
`/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses on **link handling, classification
indicators, the `-d`/`-R` traversal modes, and how multiple file/dir arguments
are presented** — long-format columns, sorting flags, color, and quoting are not
the focus here (though entries are still name-sorted).

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

### Indicators & classification

| Flag | Description |
|------|-------------|
| `-F`, `--classify` | Append an indicator: `/` dir, `*` exec, `@` symlink, `\|` FIFO, `=` socket |
| `--file-type` | Like `-F` but never append `*` for executables |
| `-p`, `--indicator-style=slash` | Append `/` to directories only |
| `--indicator-style=WORD` | `none` / `slash` / `file-type` / `classify` |

### Symlinks

| Flag | Description |
|------|-------------|
| `-L`, `--dereference` | Show info for the link target, not the link itself |
| `-H`, `--dereference-command-line` | Dereference only symlinks named on the command line |

### Traversal

| Flag | Description |
|------|-------------|
| `-d`, `--directory` | List directory entries themselves, not their contents |
| `-R`, `--recursive` | List subdirectories recursively |

### Combined in some cases

| Flag | Description |
|------|-------------|
| `-l` | Long listing (shows `name -> target` for links; cases that use it require correct long output) |
| `-a` | Include entries starting with `.` |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order |
| `COLUMNS` | Output width (set to `80`) |
| `TZ` | Timezone (`UTC`) |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- **Symlinks**: by default a symlink is listed by its own name (and, in long
  format, as `name -> target`). With `-L`, stat the **target** and present the
  link as that target type. `-H` dereferences only links given directly as
  command-line arguments.
- **Indicators**: `-F` appends a single trailing character based on file type;
  `--file-type` is `-F` without `*`; `-p` adds `/` to directories only. A broken
  symlink under `-F` is still classified by the link itself (`@`).
- **`-d`**: do not descend into directory arguments — list the directory name
  itself.
- **`-R`**: print the starting directory, then for each subdirectory (in sorted
  order) a blank line, a `path:` header, and that directory's listing,
  recursively. `.` and `..` are not recursed into.
- **Multiple arguments**: non-directory arguments are listed first (sorted),
  then each directory is listed under a `dirname:` header (a blank line
  separates groups). With a single directory argument, no header is printed.
- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your implementation is evaluated against a hidden suite covering a symlink-rich
fixture (file/dir links, broken links, link chains), classification over special
files (FIFOs, executables, sockets), `-d` on directories, `-R` over a deep tree,
and multi-argument invocations mixing files and directories. Each case runs your
binary and GNU `ls` on the same inputs, flags, and environment, and compares
output after trailing-whitespace normalization; they must match exactly.

## Time Limit

You have **2 hours** (7200 seconds). Get a plain listing working, then add
indicators, then `-d`, then `-L`/`-H`, then the `-R` recursion and multi-arg
header logic. When ~10 minutes remain, run a final `cargo build --release`, copy
the binary to `/app/workspace/rls`, and make sure it runs without crashing.

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

- Use `lstat` by default and `stat` (follow) under `-L`; `-H` follows only the
  argv-level paths, not links discovered inside a directory.
- For `-R`, the header path is the path **as the user supplied it** joined with
  subdirectory names (e.g. `fixtures/deep/level1`). Emit a blank line before
  every header except the first listing.
- The classify indicator order matters for sockets/FIFOs/links — replicate
  GNU's mapping exactly, and remember `--file-type` differs from `-F` only by
  not marking executables with `*`.
- Multi-argument output: files first (as a single sorted block), then each
  directory with its own header; directories are processed in sorted order.
