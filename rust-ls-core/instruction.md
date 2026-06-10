# Rust `ls` — Core (Listing + Long Format + Sorting)

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
across its three foundational behaviors: **basic listing, long format, and
sorting**. Your implementation must be a standalone binary located at
`/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This is a **milestone** task combining the three core tiers; columns, color,
quoting, recursion, and time/size formatting are not the focus here.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

### Listing & filtering

| Flag | Description |
|------|-------------|
| `-1` | One entry per line |
| `-a`, `--all` | Show entries starting with `.` (incl. `.` and `..`) |
| `-A`, `--almost-all` | Like `-a` but omit `.` and `..` |

### Long format

| Flag | Description |
|------|-------------|
| `-l` | Long listing format |
| `-g` | Like `-l` but omit the owner column |
| `-o` | Like `-l` but omit the group column |
| `-G`, `--no-group` | In long format, omit the group column |
| `-n`, `--numeric-uid-gid` | Long format with numeric UID/GID |
| `-i`, `--inode` | Print inode number |
| `-s`, `--size` | Print allocated size in blocks |
| `--author` | Print the author column (with `-l`) |
| `-L`, `--dereference` | Show info for a symlink's target, not the link itself |

### Sorting

| Flag | Description |
|------|-------------|
| `-S` | Sort by size, largest first |
| `-t` | Sort by modification time, newest first |
| `-r`, `--reverse` | Reverse the sort order |
| `-U` | Do not sort — directory order |
| `-v` | Natural / version sort |
| `-X` | Sort by extension |
| `-f` | Do not sort; enables `-a`, disables `-l` |
| `--sort=WORD` | `none`/`size`/`time`/`version`/`extension` |
| `--group-directories-first` | List directories before files |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order |
| `COLUMNS` | Output width (set to `80`) |
| `TZ` | Timezone (`UTC`) — affects long-format dates and time sorts |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- **Default**: name-sorted (`LC_ALL=C`), one entry per line (stdout is not a
  terminal during testing).
- **Long format (`-l`)**: `total <blocks>` header, then
  `<perms> <nlinks> <owner> <group> <size> <date> <name>` with right-aligned
  numeric columns; permission   string includes type char and setuid/setgid/
  sticky bits; recent files show `Mon DD HH:MM`, older files `Mon DD  YYYY`;
  symlinks show `name -> target` (or, under `-L`, the target's own info).
  `-g`/`-o`/`-G` drop a column; `-n` numeric IDs; `-i`/`-s` prepend
  inode/blocks.
- **Sorting**: the sort flags change the primary key; ties fall back to the
  byte-order name sort; `-r` reverses; `-U`/`-f` disable sorting.
- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your output is compared against GNU `ls` run on the same inputs, flags, and
environment (after trailing-whitespace normalization on each line); it must
match exactly. Aim for faithful, broad coverage of all three areas — basic
listing, long format, and sorting — rather than perfecting one and skipping the
others.

## Time Limit

You have **2 hours** (7200 seconds). Get a compiling one-per-line listing early,
then build the long-format columns, then the sort keys. When ~10 minutes remain,
run a final `cargo build --release`, copy the binary to `/app/workspace/rls`,
and make sure it runs without crashing.

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

Example fixtures are in `/app/workspace/examples/`:

```bash
diff <(/app/workspace/rls -l /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t2_basic_long.txt
```

Test fixtures are in `/app/fixtures/` and test definitions in `/app/tests/`.

## Tips

- Both your binary and the oracle run on the same filesystem, so inode/owner/
  group/size/nlinks/block columns match when read with `stat`/`lstat`.
- `LC_ALL=C` means ASCII byte-order sorting (uppercase before lowercase).
- **Version sort (`-v`)** compares digit runs numerically and other runs
  byte-wise (`file2` < `file10`).
- All fixture timestamps are fixed past dates, so the recent-vs-old date format
  switch is deterministic.
