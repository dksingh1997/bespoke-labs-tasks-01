# Rust `ls` — Long Format (`-l`) Compatibility

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**long-format** output. Your implementation must be a standalone binary located
at `/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses entirely on the **long listing
format and its column variants** — basic listing, sorting, color, and the other
feature families are not evaluated here.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly. (`-a`/`-A` are included because the long-format cases combine them,
e.g. `-la`.)

### Long listing

| Flag | Description |
|------|-------------|
| `-l` | Long listing format |
| `-g` | Like `-l` but omit the owner column |
| `-o` | Like `-l` but omit the group column |
| `-G`, `--no-group` | In long format, omit the group column |
| `-n`, `--numeric-uid-gid` | Like `-l` with numeric UID/GID |
| `-i`, `--inode` | Print inode number (works with `-l`) |
| `-s`, `--size` | Print allocated size in blocks (works with `-l`) |
| `--author` | Print the author of each file (with `-l`) |

### Listing & filtering (needed by the long-format cases)

| Flag | Description |
|------|-------------|
| `-a`, `--all` | Show entries starting with `.` |
| `-A`, `--almost-all` | Like `-a` but omit `.` and `..` |
| `-L`, `--dereference` | Show info for the link target, not the link itself |

## Environment Variables

Your implementation must respect:

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` during testing — affects sort order |
| `COLUMNS` | Output width (set to `80` during testing) |
| `TZ` | Timezone (set to `UTC` during testing) |
| `TERM` | Terminal type (set to `xterm-256color`) |

## Long format (`-l`) output

```
total <blocks>
<permissions> <nlinks> <owner> <group> <size> <date> <name>
```

- **Permission string**: `drwxrwxrwx` form, with the leading type char
  (`-` file, `d` dir, `l` symlink, `p` FIFO, `s` socket, `c`/`b` device) and
  special bits (`s`/`S` for setuid/setgid, `t`/`T` for sticky).
- The **`total`** line shows allocated blocks in 1024-byte units by default.
- **Columns are right-aligned** to a common width per column (nlinks, owner,
  group, size).
- **Date format depends on file age**: recent files show `Mon DD HH:MM`, older
  files (> ~6 months) show `Mon DD  YYYY` (note the two spaces).
- **Symlinks** are shown as `name -> target` (unless `-L` dereferences them).
- With `-i`/`-s`, the inode / block columns are prepended and also right-aligned.

## Output Behavior

- **No arguments**: list the current directory.
- **File arguments**: list those files with their long-format info.
- **Directory arguments**: list directory contents.
- **Exit code**: 0 on success, non-zero on error (e.g. nonexistent path).

## Evaluation

Your implementation is evaluated against a hidden suite of long-format cases
spanning regular files, directories, dotfiles, permission/setuid/sticky bits,
varied sizes, symlinks, special files (FIFOs), and timestamps. Each case runs
your binary and GNU `ls` on the same inputs, flags, and environment, and
compares their output after trailing-whitespace normalization on each line; they
must match exactly. Aim for faithful reproduction of the long-format columns
rather than optimizing any single case.

## Time Limit

You have **2 hours** (7200 seconds). After that the environment is terminated
and whatever binary exists at `/app/workspace/rls` is evaluated.

**Strategy**: get a compiling binary that prints a single-column long listing
early, then refine the column alignment, permission bits, date formatting, and
symlink/`-L` handling. When ~10 minutes remain, stop adding features, run a
final `cargo build --release`, copy the binary to `/app/workspace/rls`, and
make sure it runs without crashing.

## Constraints

- You must implement this in **Rust**.
- You may **not** use the `uutils` crate or any crate that provides a
  ready-made `ls` implementation.
- You may use standard library crates and general-purpose crates (e.g. `libc`,
  `nix`, `clap`, `chrono`).
- Your final binary must be at `/app/workspace/rls`.
- The system `ls` command is disabled in the environment — do not attempt to
  call it.
- Each test has a per-case timeout (10 seconds).

## Getting Started

Example fixtures are in `/app/workspace/examples/`:
- `basic/` — a simple directory with text files and subdirectories
- `expected/` — expected outputs for a few long-format cases

You can validate your implementation against the examples:

```bash
diff <(/app/workspace/rls -l  /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t2_basic_long.txt

diff <(/app/workspace/rls -la /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t2_basic_long_all.txt
```

Test fixtures are in `/app/fixtures/` and test definitions in `/app/tests/`.

## Tips

- Both your implementation and the oracle run on the same filesystem, so block
  counts, inode numbers, owner/group names, nlinks, and sizes will match if you
  read them with the standard `stat`/`lstat` calls.
- The test environment uses `LC_ALL=C` — this affects sort order (ASCII byte
  order). The default sort within long format is by name.
- All fixture file timestamps are fixed dates in the past (2000–2020), so the
  `Mon DD  YYYY` vs `Mon DD HH:MM` switch is deterministic.
- `-g`, `-o`, and `-G` each drop exactly one column; `-n` swaps owner/group
  names for their numeric IDs.
