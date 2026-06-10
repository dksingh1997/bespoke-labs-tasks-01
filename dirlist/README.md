# Rust `ls` — Basic Listing (scoped variant of `rust-ls`)

> A scoped slice of the full `rust-ls` task. The agent implements a GNU
> coreutils-compatible `ls` clone in Rust, but is evaluated **only** on
> basic directory listing and dotfile filtering (`-1 -a -A`). The oracle is GNU `ls` itself (decrypted at verify time), so the
> hidden suite is exact-match against real coreutils output. Other feature
> families are covered by sibling `rust-ls-*` tasks.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | easy |
| Category | programming |
| Agent Timeout | 2 hours |
| Verifier Timeout | 1 hour |
| Internet Access | Disabled |
| CPUs / Memory | 2 CPUs / 8192 MB (storage 10240 MB) |
| Scored tiers | `tier1_basic` (weight 1.0) |

---

## Relationship to the parent task

Generated from `rust-ls/` by scoping `SCOPE_TIERS = {1}` in
`environment/build_tests.py` and re-normalizing the `tier1_basic` weight to 1.0 in
`tests/compute_reward.py`. The verifier, anti-cheat, oracle-decrypt, and
build-from-source enforcement are identical to the parent; only the curated
test tier, scoring weights, instruction scope, and `HARBOR_ORACLE_FLAG` token
differ. See `rust-ls/ANTI_CHEAT.md` and `rust-ls/README.md` for the full
threat model and pre-rollout QA.

## Oracle / baseline

- **Oracle** (`solution/solve.sh`): decrypts the baked GNU `ls` to
  `/app/workspace/rls` and writes the `HARBOR_ORACLE_FLAG` marker → scores 1.0.
- **Baseline** (empty / non-building workspace): 0.0 — the verifier requires a
  from-source Rust build producing `target/release/<binname>`.
