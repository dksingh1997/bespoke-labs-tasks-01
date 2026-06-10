# Rust `ls` — Performance on Large Directories

## Task

Build an **`ls` command clone** in Rust that lists a **very large directory
(10,000 entries)** correctly and quickly, matching GNU coreutils `ls`. Your
implementation must be a standalone binary located at `/app/workspace/rls`. It
will be invoked as:

```
/app/workspace/rls [OPTIONS] [FILE]...
```

For the same inputs, flags, and environment variables, it must produce the same
output as GNU `ls`. This scoped task focuses on **scaling**: producing
byte-for-byte correct output over a 10k-entry directory within a tight per-case
time budget. The flag surface is small; the challenge is efficiency.

## Required Flags

You must support the following flags. Behavior must match GNU coreutils `ls`
exactly.

| Flag | Description |
|------|-------------|
| (none) | Default listing (one entry per line when output is not a terminal) |
| `-1` | One entry per line |
| `-l` | Long listing format (stat every entry) |
| `-S` | Sort by size, largest first |
| `-C` | Multi-column output, sorted down columns |

## Environment Variables

| Variable | Usage |
|----------|-------|
| `LC_ALL` | Always set to `C` — affects sort order |
| `COLUMNS` | Output width (set to `80`) |
| `TZ` | Timezone (`UTC`) |
| `TERM` | Terminal type (`xterm-256color`) |

## Output Behavior

- The directory contains 10,000 regular files named `file_00000.dat` …
  `file_09999.dat` (plus possible variety), all with fixed metadata.
- Output must match GNU `ls` exactly for each flag — correct name sort
  (`LC_ALL=C`), correct long-format columns under `-l`, correct size sort under
  `-S`, and correct column packing under `-C`.
- **Exit code**: 0 on success, non-zero on error.

## Evaluation

Your output over the 10k-entry directory is compared against GNU `ls` run on the
same input and environment (after trailing-whitespace normalization); it must
match exactly, for each of `no flags`, `-1`, `-l`, `-S`, and `-C`. Because the
directory is large and each case has a **60-second budget** (see Constraints),
efficient directory reading, minimal per-entry syscalls, and buffered output
matter as much as correctness.

## Time Limit

You have **2 hours** (7200 seconds) of agent time. Get correctness first on a
smaller directory, then ensure the 10k cases complete well within 60s — buffer
stdout, avoid O(n²) work in sorting/column layout, and minimize per-entry
syscalls (only `-l` needs a stat per entry). When ~10 minutes remain, run a
final `cargo build --release`, copy the binary to `/app/workspace/rls`, and make
sure it runs without crashing.

## Constraints

- You must implement this in **Rust**.
- You may **not** use the `uutils` crate or any crate that provides a
  ready-made `ls` implementation.
- You may use standard library crates and general-purpose crates (e.g. `libc`,
  `nix`, `clap`).
- Your final binary must be at `/app/workspace/rls`.
- The system `ls` command is disabled — do not attempt to call it.
- Each performance test has a per-case timeout of **60 seconds**.

## Getting Started

Example fixtures are in `/app/workspace/examples/`. Test fixtures are in
`/app/fixtures/` (the large one is `perf_10k`) and test definitions in
`/app/tests/`.

## Tips

- **Buffer your output** — wrap stdout in a `BufWriter` and write once; per-line
  unbuffered writes over 10k entries are a common cause of timeouts.
- Read the directory once; for non-`-l` modes you do not need to stat each
  entry, which saves 10k syscalls.
- Use an efficient sort (the standard library sort is fine); compare names as
  raw bytes for `LC_ALL=C`.
- For `-C`, compute the column layout in O(n) per candidate column count, not by
  re-scanning all entries repeatedly.
