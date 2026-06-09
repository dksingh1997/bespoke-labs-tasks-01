# Rust `ls` — GNU Coreutils Compatible Clone

> The agent must implement a GNU coreutils-compatible `ls` clone in Rust, delivered as a standalone binary built from source. It must reproduce GNU `ls` output byte-for-byte across ~75 flags spanning listing, long format, sorting, output formatting, symlinks/recursion, quoting/escaping, time/size formatting, and color. The core challenge is faithfully reproducing dozens of subtle coreutils behaviors and flag-interaction edge cases without using any ready-made `ls` crate.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | very_hard |
| Category | programming |
| Agent Timeout | 2 hours |
| Verifier Timeout | 1 hour |
| Internet Access | Disabled |
| CPUs / Memory | 2 CPUs / 8192 MB (storage 10240 MB) |

---

## Pre-Rollout QA

> Automated analysis + manual review of task definition before any compute is spent on rollouts.

### Structure & Format

| Check | Status | Detail |
|-------|--------|--------|
| Required files | PASS | instruction.md, task.toml, environment/Dockerfile, tests/test.sh all present |
| task.toml | PASS | allow_internet=false; agent 7200s (justified for very_hard full port); verifier 3600s; build 600s; user="agent" |
| Dockerfile | WARN | git+tmux+strace present, apt cleaned; rustup via curl-pipe-bash with no pinned toolchain; apt packages unversioned |
| reward.json schema | PASS | compute_reward.py writes score, reward, subscores (list), additional_data (dict); reward.txt written; no stray top-level keys |
| Oracle solution | PASS | solve.sh decrypts baked oracle.enc → /app/workspace/rls + writes HARBOR_ORACLE_FLAG marker; paths correct |
| oracle.yaml / job.yaml | WARN | Both present at task level; job.yaml sandbox_timeout_secs=7200 < agent(7200)+verifier(3600)+1800 buffer |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Unambiguous flag-by-flag spec; output behavior, env vars, deliverable path stated; no verifier contradictions |
| Scoring leakage | PASS | No reward/score/test.sh/verifier internals leaked; LS_COLORS value is task-required input, not scoring info; "evaluated against a hidden suite" is acceptable phrasing |
| Tone & length | WARN | 210 lines (exceeds 200); content is largely a flag reference table that is genuinely part of the spec; timeout/best-effort guidance present (lines 169-173) |

### Reward Design

**Formula**: `score = Σ (tier_pass_rate × tier_weight)` over 9 tiers

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| tier1_basic | pass rate vs fresh-oracle diff | weight 0.03 |
| tier2_long_format | pass rate vs fresh-oracle diff | weight 0.12 |
| tier3_sorting | pass rate vs fresh-oracle diff | weight 0.10 |
| tier4_formatting | pass rate vs fresh-oracle diff | weight 0.00 (run but unweighted) |
| tier5_symlinks_recursion | pass rate vs fresh-oracle diff | weight 0.20 |
| tier6_quoting_escaping | pass rate vs fresh-oracle diff | weight 0.22 |
| tier7_time_size | pass rate vs fresh-oracle diff | weight 0.15 |
| tier8_color_advanced | pass rate vs fresh-oracle diff | weight 0.15 |
| tier9_performance | pass rate vs fresh-oracle diff (60s/case) | weight 0.03 |

**Design rationale**: Each case runs the agent binary and the decrypted oracle `ls` on identical inputs/flags/env and requires an exact match after trailing-whitespace normalization — correctness is the only thing measured, so there is no speed/efficiency term to inflate incorrect output. Tier weights reflect difficulty/importance (quoting and symlinks/recursion weighted highest at 0.22/0.20; basic listing lowest at 0.03). Tier4 (column formatting) runs its cases but contributes 0.00 by design — exact column-width reproduction is too brittle to gate reward on; weights live only in root-only test.sh so the agent cannot learn this.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` is set (line 10). |
| Dockerfile user setup | PASS | `useradd agent`; `chown -R agent:agent /app`; `/tests` created `chmod 700` (re-asserted 700 + `go-rwx` strip except fixtures); `/solution` `chown agent:agent`. |
| Dockerfile strace | PASS | `strace` installed; required — verifier builds (build.rs) and executes the agent ELF during verification. |
| test.sh /logs lockdown | PASS | First actions `chmod 700 "$VERIFIER_DIR"` then `rm -rf "${VERIFIER_DIR:?}"/*` (lock-before-wipe). |
| test.sh strace wrapping | PASS | Both `cargo build` and per-case agent exec run under `strace -f` with `timeout`; oracle output + diff scoring run root-side OUTSIDE strace. |
| Scoring imports /app | PASS | `compute_reward.py` runs `python3 -ISs`, reads only CLI args + verifier-written subscores file; never imports/reads `/app`. |

### Anti-Cheat Measures

**User/environment isolation**
- Agent binary AND build.rs run as non-root `agent` under `su agent` with `env -i` re-adding only output-affecting vars, so `$ORACLE`/`$FIXTURES`/`$TESTS_DEFS_DIR` are never inherited; fixture path passed only as argv.
- test.sh unsets `LD_PRELOAD/LD_LIBRARY_PATH/PYTHONPATH/PYTHONHOME/BASH_ENV/ENV/CARGO_*` and re-locks `/tests` to 700 after Harbor's upload resets it to 0755.

**Process fencing (strace + pkill)**
- `pkill -9 -u agent` twice with retry before scoring; refuses to score (`agent_processes_survived`) if any agent process survives — kills background reward-writers.
- `strace -f` on build and each agent run; scans logs for `openat(...reward.{txt,json}...O_WRONLY|O_RDWR|O_CREAT)` → zeroes with cheat multiplier; blocks until all forks exit.

**Shell-out / oracle-theft tripwires**
- strace `execve` scan bans the agent calling `ls`/`dir`/`vdir`/decrypted-oracle basename — prevents shelling out to real `ls` or the oracle for byte-identical output.
- System `ls`/`dir`/`vdir` replaced with error stubs; oracle baked as one-layer encrypted blob (`oracle.enc`, AES-256, key only in test.sh) then plaintext deleted — agent cannot extract the reference binary.

**Build-from-source enforcement**
- Requires `/app/workspace/Cargo.toml`; deletes any prebuilt `rls`/`target/release/<binname>` BEFORE build, then picks the freshly built ELF strictly by crate's resolved `[[bin]].name`/`package.name` (not "first ELF in glob") — defeats smuggled prebuilt/differently-named ELFs.
- Oracle decrypt is ELF-validated via `file`; refuses to score on tampered ciphertext, so a trivial binary can't "match" decrypted garbage.

**Static workspace greps + hash check**
- Greps `/app/workspace` for `/oracle/`, `.test_data`, `oracle.enc`, decryption key, reward paths, `uutils/coreutils`, `ls_backup`, `dir|vdir` references; rejects sha256-identical-to-oracle binary.

**Oracle gating**
- Anti-cheat/build-enforcement bypass requires `/app/.harbor_oracle_marker` to contain the secret `HARBOR_ORACLE_FLAG`; injected only into oracle runs via `[solution.env]`, never visible to the agent (unforgeable).

**Scoring design**
- Per-tier weighted sum (weights sum to 1.0): correctness measured by exact `diff` of agent vs. trusted-oracle output per case, so partial-credit reflects genuine feature coverage; tier4 weighted 0.00 (excluded). Cheat detection sets `cheating_penalty_multiplier=0.0` → hard zero; reward written atomically (tmpfile + `os.replace`) so no half-written score is observable. Unmodified baseline (no Cargo.toml) → `not_a_rust_project` → 0.0.

### Undefended attack surfaces

(No meaningful undefended vectors found. Isolation checklist passes; build-from-source, encrypted oracle, strace execve/reward tripwires, env scrubbing, and `env -i` argv-only fixture passing close the domain-specific vectors — shelling to real `ls`, embedding/extracting the oracle, prebuilt-binary smuggling, and reward manipulation during build or run.)

### Acknowledged gaps

- `/logs/agent/` trace tampering is unpreventable by design (agent can mutate its own traces pre-verification) — inherent to the single-container model, not specific to this task.

**Verdict: PASS**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Score is purely exact-match correctness; no speed/efficiency term; per-case binary pass/fail |
| Test quality | PASS | ~322 cases across 9 tiers, 18 fixtures (perms/setuid/sticky, symlinks, control-char names, versions, backups, 10k-file perf) |
| Determinism | PASS | Fixed fixture timestamps (2000-2020), LC_ALL=C, TZ=UTC, COLUMNS=80; no random seeds; perf judged by correctness within timeout, not timing margins |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | PASS | No meaningful gaps found |
| Baseline reward | PASS | No binary / no Cargo.toml → emit_fail → 0.0; empty output never diff-matches oracle |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | Rust toolchain installed system-wide in /usr/local (a+rX) so non-root agent can run cargo; agent authors its own crate; verifier runs `cargo build --release` |
| Instruction ↔ workspace | PASS | Allowed crates (libc/nix/clap/regex) reachable via cargo; examples/ + /app/fixtures + /app/tests JSON defs generated at build for self-validation; system ls intentionally disabled (stated in instruction) |
| Reference docs | PASS | examples/ (basic fixture + expected outputs), /app/fixtures (18 dirs), /app/tests/tier*/ JSON test defs provided; GNU ls is well-documented |

### Notes

- **Dockerfile reproducibility (WARN, accepted)**: rustup installed via `curl … | sh` with no pinned toolchain version; apt packages unversioned. Builds are not bit-reproducible across time; acceptable for a no-internet-at-runtime task but worth pinning.
- **job.yaml sandbox timeout (WARN)**: Per the Modal timeout rule, `sandbox_timeout_secs` should exceed `agent_timeout + verifier_timeout + 1800` (= 12600). job.yaml sets 7200 — agent runs may be cut before the verifier completes. oracle.yaml (1800) is fine since solve.sh decrypts quickly.
- **Instruction length (WARN, accepted)**: 210 lines, just over the 200 guideline. The bulk is the flag reference table, genuinely part of the spec and not misleading.
- **Toolchain accessibility**: The Dockerfile installs Rust system-wide into `/usr/local/{rustup,cargo}` (chmod a+rX) and exports PATH for login/interactive shells — this addresses the prior failure mode where rustup landed in root-only `/root/.cargo`, unreachable by the non-root agent.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

### Overview

| Metric | Value |
|--------|-------|
| Trials | 2 |
| Models tested | 1 |
| Overall success rate | 0/2 (0%) |
| Mean reward | 0.0000 |
| Reward range | 0.0000 – 0.0000 |
| Total cost | $5.10 |
| Oracle reward | 1.0000 (job: 2026-06-09__12-43-23) |

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 0/2 (0%) | 0.0000 | 120m 0s | $2.55 |
| **Overall** | **2** | **0/2 (0%)** | **0.0000** | **120m 0s** | **$2.55** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| RemZjGE | 0.0000 | 120m 0s | $2.69 | Agent timeout (2h); only a geteuid build stub written | Recon-first analysis paralysis; ~57% of budget lost to LLM API latency |
| st8vF8i | 0.0000 | 120m 0s | $2.41 | Agent timeout (2h); only empty cargo skeleton | Explore-everything-then-implement; never started coding before timeout |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 2/2 FAIR |
| Infrastructure failures | Verifier never ran — expected sandbox teardown after agent timeout |
| Task fairness issues | None — task is hard, agent never implemented anything |
| False negatives | None |
| False positives | None |
| Reward hacking attempts | None |
| Verifier quality issues | None — verifier never exercised (no deliverable) |
| Verifier timeout buffer | OK — oracle verifier ~45s vs 3600s limit (~80x) |
<!-- END:ROLLOUT_RESULTS -->
