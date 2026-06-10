# Rust `ls` — Time & Size Formatting

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**time and size formatting** in long listings. Your implementation must be a
standalone binary located at `/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses on **human-readable sizes,
block-size scaling, which timestamp is shown, and how dates are formatted** —
the other feature families are not evaluated here. You will need a working
long-format (`-l`) listing as the substrate, since these flags modify its size
and date columns.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

### Size formatting

| Flag | Description |
|------|-------------|
| `-l` | Long listing format (substrate for the size/date columns) |
| `-h`, `--human-readable` | Human-readable sizes (e.g. `1.0K`, `234M`) with `-l`/`-s` |
| `--si` | Like `-h` but powers of 1000 (`K`=1000) |
| `-k`, `--kibibytes` | Default to 1024-byte blocks for `-s` |
| `-s`, `--size` | Print allocated size in blocks |
| `--block-size=SIZE` | Scale sizes by `SIZE` (`K`, `M`, `1`, `1K`, `1M`, …) |

### Time selection & formatting

| Flag | Description |
|------|-------------|
| `-c` | With `-lt` sort by ctime; with `-l` show ctime |
| `-u` | With `-lt` sort by atime; with `-l` show atime |
| `--time=WORD` | `atime`/`access`/`use`/`ctime`/`status` — which time to show |
| `--time-style=STYLE` | `full-iso`/`long-iso`/`iso`/`locale`/`+FORMAT` |
| `--full-time` | Like `-l --time-style=full-iso` |
| `-t` | Sort by the selected time (newest first) |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order and locale date format |
| `TZ` | Timezone (set to `UTC`) — affects displayed times |
| `COLUMNS` | Output width (set to `80`) |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- **Human sizes (`-h`)**: scale to the largest unit < 1024, one decimal for
  values < 10 (e.g. `1.0K`, `9.8K`, `10K`, `1.0M`), rounding **up**. `--si`
  uses 1000 as the base and the same unit letters.
- **`--block-size=SIZE`**: divide the byte size by `SIZE` and ceil; suffixes
  `K`/`M` mean 1024/1048576, a leading number like `1K` is explicit.
- **`-s`**: the allocated block count; `-k` forces 1024-byte units.
- **Date formats**: `long-iso` → `YYYY-MM-DD HH:MM`; `full-iso` →
  `YYYY-MM-DD HH:MM:SS.ttttttttt ±ZZZZ`; `iso` → `MM-DD HH:MM` (recent) /
  `YYYY-MM-DD` (old); `locale`/default → `Mon DD HH:MM` (recent) /
  `Mon DD  YYYY` (old); `+FORMAT` → strftime-style custom format.
- **`-c`/`-u`/`--time=`** select which of mtime/ctime/atime is displayed and/or
  sorted on.
- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your implementation is evaluated against a hidden suite over a size-graded
fixture (empty through multi-megabyte files) and a timestamp-graded fixture
(fixed dates 2000–2020), exercising every flag above. Each case runs your binary
and GNU `ls` on the same inputs, flags, and environment, and compares output
after trailing-whitespace normalization on each line; they must match exactly.

## Time Limit

You have **2 hours** (7200 seconds). Build a basic `-l` listing, then layer in
size scaling, then the time-style formats and time-source selection. When ~10
minutes remain, run a final `cargo build --release`, copy the binary to
`/app/workspace/rls`, and make sure it runs without crashing.

## Constraints

- You must implement this in **Rust**.
- You may **not** use the `uutils` crate or any crate that provides a
  ready-made `ls` implementation.
- You may use standard library crates and general-purpose crates (e.g. `libc`,
  `nix`, `clap`, `chrono`).
- Your final binary must be at `/app/workspace/rls`.
- The system `ls` command is disabled — do not attempt to call it.
- Each test has a per-case timeout (10 seconds).

## Getting Started

Example fixtures are in `/app/workspace/examples/`. Test fixtures are in
`/app/fixtures/` and test definitions in `/app/tests/`.

## Tips

- All fixture timestamps are fixed past dates (`TZ=UTC`), so the recent-vs-old
  date switch (~6 months) is deterministic — anything ≥ ~6 months old shows the
  `Mon DD  YYYY` form (note the **two** spaces before a 1-digit day too).
- `-h` rounds **up** to the displayed precision; verify against `ls -lh` on the
  `sizes` fixture for the exact boundary behavior (e.g. 1023 bytes → `1.0K`).
- `--time-style=+FORMAT` follows `strftime`; implement the conversions that
  appear in the suite (`%Y %m %d %H %M`).
- `--full-time` is exactly `-l --time-style=full-iso`.
