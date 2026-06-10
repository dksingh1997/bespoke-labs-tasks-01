# Rust `ls` — Long Format (scoped variant of `rust-ls`)

> A scoped slice of the full `rust-ls` task. The agent implements a GNU
> coreutils-compatible `ls` clone in Rust, but is evaluated **only** on the
> long-listing format (`-l` and its variants: `-g -o -G -n -i -s --author`,
> plus `-a -A -L` as they combine with `-l`). The oracle is GNU `ls` itself
> (decrypted at verify time), so the hidden suite is exact-match against real
> coreutils output. Other feature families (sorting, columns, quoting, color,
> recursion, time/size formatting, performance) are covered by sibling
> `rust-ls-*` tasks.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | programming |
| Agent Timeout | 2 hours |
| Verifier Timeout | 1 hour |
| Internet Access | Disabled |
| CPUs / Memory | 2 CPUs / 8192 MB (storage 10240 MB) |
| Scored tiers | `tier2_long_format` (weight 1.0) |

---

## Relationship to the parent task

This task is generated from `rust-ls/` by scoping `SCOPE_TIERS = {2}` in
`environment/build_tests.py` and re-normalizing the `tier2_long_format` weight
to 1.0 in `tests/compute_reward.py`. The verifier, anti-cheat, oracle-decrypt,
and build-from-source enforcement are identical to the parent; only the curated
test tier, the scoring weights, the instruction scope, and the
`HARBOR_ORACLE_FLAG` token differ. See `rust-ls/ANTI_CHEAT.md` and
`rust-ls/README.md` for the full threat model and pre-rollout QA.

## Oracle / baseline

- **Oracle** (`solution/solve.sh`): decrypts the baked GNU `ls` to
  `/app/workspace/rls` and writes the `HARBOR_ORACLE_FLAG` marker → scores 1.0.
- **Baseline** (empty / non-building workspace): 0.0 — the verifier requires a
  from-source Rust build producing `target/release/<binname>`.
