# Rust `ls` — Color, Filtering & Flag Combinations

## Task

Build an **`ls` command clone** in Rust that reproduces GNU coreutils `ls`
**colorized output, ignore/hide filtering, SELinux context, and multi-flag
combinations**. Your implementation must be a standalone binary located at
`/app/workspace/rls`. It will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This is the **advanced/integration** tier: cases combine
color with long format, recursion, classification, and sorting, so a fairly
complete `ls` is needed — but the focus is on **color output, ignore/hide
filtering, SELinux context, and correct flag interaction**.

## Required Flags

### Color

| Flag | Description |
|------|-------------|
| `--color[=WHEN]` | `always`/`auto`/`never` — colorize using `LS_COLORS` |

When `--color=always` is set, wrap each name in the ANSI escape derived from
`LS_COLORS` based on file type / permission bits. The test environment uses:

```
LS_COLORS="rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=00:tw=30;42:ow=34;42:st=37;44:ex=01;32"
```

### Filtering

| Flag | Description |
|------|-------------|
| `-B`, `--ignore-backups` | Ignore entries ending with `~` |
| `-I PATTERN`, `--ignore=PATTERN` | Ignore entries matching the shell glob PATTERN |
| `--hide=PATTERN` | Like `-I` but overridden by `-a`/`-A` |

### Context

| Flag | Description |
|------|-------------|
| `-Z`, `--context` | Print SELinux context (display `?` when unavailable) |

### Combinations exercised

The suite also runs bundled flags such as `-laSr`, `-latr`, `-lhS`, `-RlF`,
`-lisg`, and override pairs like `-fl`, `-l -1`, `-C -l`, `-1 -C`. Your flag
parser must honor GNU's **last-one-wins** override semantics among conflicting
format/sort flags, plus the side effects of `-f` (enables `-a`, disables `-l`
and color).

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order |
| `LS_COLORS` | Color codes for `--color=always` (value above) |
| `COLUMNS` | Output width (set to `80`) |
| `TZ` | Timezone (`UTC`) |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- **Color**: emit `\033[<code>m<name>\033[0m` (with the `rs=0` reset) using the
  `LS_COLORS` entry matching the file's type (`di`, `ln`, `pi`, `so`, `bd`,
  `cd`, `ex`, `or` for broken links, special perms `su`/`sg`/`tw`/`ow`/`st`,
  …). `--color=never`/`auto` (non-tty) produce no escapes.
- **Ignore/hide**: `-B` drops `*~`; `-I`/`--hide` drop glob matches; `-a`/`-A`
  override `--hide` but not `-I`.
- **`-Z`**: print the context column (`?` in this environment) in the
  appropriate position.
- **Combinations**: apply all bundled flags together; resolve conflicts by the
  last occurrence on the command line.
- **Exit code**: 0 on success, non-zero on error.

## Output Fidelity

Reproduce GNU `ls` output for every flag and combination above. The ANSI color
escapes in particular must be byte-for-byte identical, not merely visually
similar. Favor broad correctness across color, ignore/hide filtering, context,
and flag interaction over perfecting any single case.

## Time Limit

You have **2 hours** (7200 seconds). Because this tier integrates many features,
build a solid long/sorted listing first, then add `LS_COLORS` parsing and the
filters, then verify the flag-override edge cases. When ~10 minutes remain, run a
final `cargo build --release`, copy the binary to `/app/workspace/rls`, and make
sure it runs without crashing.

## Constraints

- You must implement this in **Rust**.
- You may **not** use the `uutils` crate or any crate that provides a
  ready-made `ls` implementation.
- You may use standard library crates and general-purpose crates (e.g. `libc`,
  `nix`, `clap`, `regex`).
- Your final binary must be at `/app/workspace/rls`.
- The system `ls` command is disabled — do not attempt to call it.
- Each test has a per-case timeout (10 seconds).

## Getting Started

Example fixtures are in `/app/workspace/examples/`. Test fixtures are in
`/app/fixtures/` and test definitions in `/app/tests/`.

## Tips

- Parse `LS_COLORS` into a map; resolve a file's key by type first, then special
  bits (setuid `su`, setgid `sg`, sticky+other-writable `tw`, other-writable
  `ow`, sticky `st`), then by extension (`*.ext`) for regular files, falling
  back to `ex` for executables.
- A broken symlink uses `or` (orphan); a valid symlink uses `ln` (or its target
  color if `ln=target`).
- `-I` uses `fnmatch`-style globbing against the entry name; `--hide` is the
  same but suppressed when `-a`/`-A` is present.
- Implement flag parsing so the **last** of a conflicting set wins; `-f` has the
  documented side effects (enable `-a`, disable sorting, `-l`, and color).
