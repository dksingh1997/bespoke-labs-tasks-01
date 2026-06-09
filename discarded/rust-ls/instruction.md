# Rust `ls` — Full GNU Coreutils Compatibility

## Task

Build an **`ls` command clone** in Rust that is compatible with GNU coreutils `ls`. Your implementation must be a standalone binary located at `/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

It must produce the same output as GNU `ls` for the same inputs, flags, and environment variables.

## Required Flags

You must support the following flags and options. The behavior must match GNU coreutils `ls` exactly.

### Listing & filtering

| Flag | Description |
|------|-------------|
| `-a`, `--all` | Show entries starting with `.` |
| `-A`, `--almost-all` | Like `-a` but omit `.` and `..` |
| `-B`, `--ignore-backups` | Ignore entries ending with `~` |
| `-d`, `--directory` | List directories themselves, not their contents |
| `-I PATTERN`, `--ignore=PATTERN` | Ignore entries matching shell glob PATTERN |
| `--hide=PATTERN` | Like `-I` but overridden by `-a` or `-A` |
| `-R`, `--recursive` | List subdirectories recursively |

### Output format

| Flag | Description |
|------|-------------|
| `-1` | One entry per line |
| `-C` | Multi-column output (default for terminal) |
| `-l` | Long listing format |
| `-g` | Like `-l` but omit owner |
| `-o` | Like `-l` but omit group |
| `-n`, `--numeric-uid-gid` | Like `-l` with numeric UID/GID |
| `-m` | Comma-separated output |
| `-x` | List entries by lines instead of columns |
| `--format=WORD` | `across`/`commas`/`long`/`single-column`/`verbose`/`vertical` |
| `-w COLS`, `--width=COLS` | Set output width |
| `-T COLS`, `--tabsize=COLS` | Set tab stop width (default 8) |

### Sorting

| Flag | Description |
|------|-------------|
| `-S` | Sort by file size (largest first) |
| `-t` | Sort by modification time (newest first) |
| `-r`, `--reverse` | Reverse sort order |
| `-U` | Do not sort (directory order) |
| `-v` | Natural (version) sort |
| `-X` | Sort by extension |
| `-f` | Do not sort, enable `-a`, disable `-l` coloring |
| `--sort=WORD` | `none`/`size`/`time`/`version`/`extension` |
| `--group-directories-first` | Group directories before files |

### Long format details

| Flag | Description |
|------|-------------|
| `-i`, `--inode` | Print inode number |
| `-s`, `--size` | Print allocated size in blocks |
| `-h`, `--human-readable` | Human-readable sizes (e.g. 1K, 234M) with `-l`/`-s` |
| `--si` | Like `-h` but use powers of 1000 |
| `-k`, `--kibibytes` | Default to 1024-byte blocks for `-s` |
| `--block-size=SIZE` | Scale sizes by SIZE (`K`, `M`, `1K`, `1M`, `1`, etc.) |
| `--author` | Print author of each file (with `-l`) |

### Time display

| Flag | Description |
|------|-------------|
| `-c` | Use ctime (status change time) with `-lt`; sort by ctime with `-l` |
| `-u` | Use atime (access time) with `-lt`; sort by atime with `-l` |
| `--time=WORD` | `atime`/`access`/`use`/`ctime`/`status` — select which time to show |
| `--time-style=STYLE` | Time display: `full-iso`/`long-iso`/`iso`/`locale`/`+FORMAT` |
| `--full-time` | Like `-l --time-style=full-iso` |

### Indicators & classification

| Flag | Description |
|------|-------------|
| `-F`, `--classify` | Append indicator (`/`=dir, `*`=exec, `@`=link, `\|`=FIFO, `=`=socket) |
| `--file-type` | Like `-F` but don't append `*` for executables |
| `-p`, `--indicator-style=slash` | Append `/` to directories |
| `--indicator-style=WORD` | `none`/`slash`/`file-type`/`classify` |

### Symlinks

| Flag | Description |
|------|-------------|
| `-L`, `--dereference` | Show info for the link target, not the link itself |
| `-H`, `--dereference-command-line` | Dereference symlinks on the command line |

### Quoting & escaping

| Flag | Description |
|------|-------------|
| `-b`, `--escape` | Print C-style escapes for non-graphic characters |
| `-q`, `--hide-control-chars` | Print `?` for non-graphic characters |
| `-Q`, `--quote-name` | Enclose names in double quotes |
| `-N`, `--literal` | Print raw names (no quoting) |
| `--quoting-style=WORD` | `literal`/`shell`/`shell-always`/`shell-escape`/`shell-escape-always`/`c`/`escape` |
| `--show-control-chars` | Show non-graphic characters as-is |

### Color

| Flag | Description |
|------|-------------|
| `--color[=WHEN]` | `always`/`auto`/`never` — colorize output using `LS_COLORS` |

When `--color=always` is specified, apply ANSI escape sequences based on the `LS_COLORS` environment variable. The test environment uses:

```
LS_COLORS="rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=00:tw=30;42:ow=34;42:st=37;44:ex=01;32"
```

### Context

| Flag | Description |
|------|-------------|
| `-Z`, `--context` | Print SELinux security context (displays `?` when not available) |

## Environment Variables

Your implementation must respect:

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` during testing — affects sort order |
| `COLUMNS` | Output width (set to `80` during testing) |
| `TZ` | Timezone (set to `UTC` during testing) |
| `LS_COLORS` | Color codes for `--color=always` |
| `TERM` | Terminal type (set to `xterm-256color`) |

## Output Behavior

- **No arguments**: List current directory
- **File arguments**: List those files (with info if `-l`)
- **Directory arguments**: List directory contents, with `dirname:` header when multiple arguments
- **Mixed arguments**: Files listed first, then each directory with header
- **Exit code**: 0 on success, non-zero on error (e.g. nonexistent path)

### Long format (`-l`) output

```
total <blocks>
<permissions> <nlinks> <owner> <group> <size> <date> <name>
```

- Permission string: `drwxrwxrwx` with special bits (`s`/`S` for setuid/setgid, `t`/`T` for sticky)
- The "total" line shows allocated blocks (in 1024-byte units by default)
- Date format depends on file age: recent files show `Mon DD HH:MM`, older files show `Mon DD  YYYY`
- Symlinks shown as `name -> target`

### Column format (`-C`)

- Entries sorted vertically (down columns)
- Column width: longest name + 2 (padded with spaces)
- Total width: respects `COLUMNS` environment variable (default 80)
- Tab stops controlled by `-T` (default 8)

## Scoring

Your implementation is tested against **322 test cases** organized into 9 difficulty tiers with weighted scoring:

| Tier | Tests | Weight | What it covers |
|------|-------|--------|----------------|
| 1 — Basic listing | 30 | 3% | No flags, `-1`, `-a`, `-A` |
| 2 — Long format | 48 | 12% | `-l`, `-n`, `-g`, `-o`, `-i`, `-s`, `--author` |
| 3 — Sorting | 65 | 10% | `-S`, `-t`, `-r`, `-v`, `-X`, `-U`, `-f`, `--sort`, `--group-directories-first` |
| 4 — Formatting | 38 | 0% | `-C`, `-x`, `-m`, `-w`, `-T`, `--format` (unscored) |
| 5 — Symlinks & recursion | 40 | 20% | `-L`, `-H`, `-d`, `-R`, `-F`, `-p`, multi-arg |
| 6 — Quoting & escaping | 31 | 22% | `-b`, `-q`, `-Q`, `-N`, 7 quoting styles |
| 7 — Time & size | 28 | 15% | `-h`, `--si`, `--block-size`, `--time-style`, `--full-time` |
| 8 — Color & advanced | 37 | 15% | `--color`, `-B`, `-I`, `--hide`, `-Z`, flag override combos |
| 9 — Performance | 5 | 3% | 10,000-file directory, 60-second timeout |

For each test, your binary's output (after trailing-whitespace normalization) is compared against the expected output from GNU `ls`. A test passes if outputs match exactly.

**Final score** = weighted sum of per-tier pass rates.

## Time Limit

You have **2 hours** (7200 seconds) to complete this task. After that, the environment is terminated and whatever binary exists at `/app/workspace/rls` is evaluated.

**Strategy**: Don't spend the entire time perfecting one tier. Get a compiling binary early, then iteratively add features. When you have ~10 minutes left, stop adding new features — do a final `cargo build --release`, copy the binary to `/app/workspace/rls`, and make sure it runs without crashing.

## Constraints

- You must implement this in **Rust**
- You may **not** use the `uutils` crate or any crate that provides a ready-made `ls` implementation
- You may use standard library crates and general-purpose crates (e.g. `libc`, `nix`, `clap`, `regex`)
- Your final binary must be at `/app/workspace/rls`
- The system `ls` command is disabled in the environment — do not attempt to call it
- Each test has a per-case timeout (10 seconds for most, 60 seconds for performance tests)

## Getting Started

Example test fixtures are in `/app/workspace/examples/`:
- `basic/` — a simple directory with text files and subdirectories
- `expected/` — expected outputs for a few test cases

You can validate your implementation against the examples:

```bash
diff <(/app/workspace/rls /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t1_basic_no_flags.txt

diff <(/app/workspace/rls -la /app/workspace/examples/basic) \
     /app/workspace/examples/expected/t2_basic_long_all.txt
```

Test fixtures are in `/app/fixtures/` (18 directories with various file types and edge cases).
Test definitions are in `/app/tests/tier*/` (JSON files describing each test's flags, fixture, and arguments).

## Tips

- Start with basic listing (`-1`, `-a`) and work up through the tiers
- The test environment uses `LC_ALL=C` — this affects sort order (ASCII byte order)
- All fixture file timestamps are set to fixed dates in the past (2000-2020) so time display is deterministic
- For `-l` format: both your implementation and the oracle run on the same filesystem, so block counts and inode numbers will match
- Column formatting (`-C`) depends on `COLUMNS=80` — make sure you read this environment variable
- The `-f` flag has side effects: it enables `-a` and disables `-l` and `--color`
