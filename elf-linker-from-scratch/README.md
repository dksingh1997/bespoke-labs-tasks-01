# ELF Static Linker From Scratch

> The agent must implement a static linker for x86-64 Linux in a single `myld.c`. It reads ELF relocatable object files (`.o`) and static archives (`.a`), resolves symbols across files, merges sections, applies relocations, and emits a runnable ELF executable — without shelling out to `ld`/`gcc`. The core challenge is parsing the ELF binary format and the System V relocation model, scaling up to linking against musl libc.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | systems-programming |
| Agent Timeout | 2 hours |
| Verifier Timeout | 10 minutes |
| Internet Access | Disabled |
| CPUs / Memory | 2 CPUs / 4096 MB |

---

## Pre-Rollout QA

> Automated analysis + manual review of task definition before any compute is spent on rollouts.

### Structure & Format

| Check | Status | Detail |
|-------|--------|--------|
| Required files | PASS | instruction.md, task.toml, environment/Dockerfile, tests/test.sh all present |
| task.toml | PASS | allow_internet=false; agent 7200s (justified for from-scratch linker); verifier 600s; build 600s; user="agent" |
| Dockerfile | WARN | git/tmux/strace present, apt cleaned, C toolchain (no pip/uv needed); apt packages unpinned |
| reward.json schema | PASS | Writes score, reward, subscores list, additional_data; no stray top-level keys |
| Oracle solution | PASS | solve.sh present; ld/gcc wrapper writes secret marker; correct /app paths |
| oracle.yaml / job.yaml | WARN | Both present at task level; job.yaml sandbox_timeout 9000 < 7200+600+1800=9600 |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Unambiguous; CLI form, link order, debug tips, archive semantics; matches verifier link order |
| Scoring leakage | PASS | No scoring/reward/test.sh mentions in instruction or workspace files the agent sees |
| Tone & length | WARN | Natural colleague tone, 51 lines; no sandbox-timeout hint to keep best work persisted |

### Reward Design

**Formula**: `clean ? Σ(tier_weight × pass_fraction) : 0.0`

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| T1 (0.08) | single .o, inline syscall; ELF + run-diff | weighted by pass fraction |
| T2 (0.12) | cross-file calls + data; run-diff + ELF | weighted by pass fraction |
| T3 (0.16) | .bss + archive pull-in; run-diff | weighted by pass fraction |
| T4 (0.24) | entry/section/nostdlib readelf + musl hello | weighted by pass fraction |
| T5 (0.40) | printf, multi-file, common symbols (musl) | weighted by pass fraction |
| Anti-gaming gate | banned ld/gcc/system/popen patterns + ≥150 LOC | hard gate → whole reward 0 if dirty |

**Design rationale**: Tier weights ramp with difficulty (0.08→0.40) so partial credit reflects genuine, escalating linker capability rather than noise. Correctness is the reward itself (no separate speed term), and the anti-gaming source gate zeros everything if the agent shells out to a real linker or submits a stub — preventing the trivial "wrap ld" cheat the instruction forbids.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` set; agent runs non-root and cannot mutate system files/binaries. |
| Dockerfile user setup | PASS | `useradd agent`; `chown -R agent:agent /app`; `/tests` `chmod 700`; `/solution` `chown agent:agent`. Plus root-only `/tests/refdata` for pristine inputs and `.ref` answer keys. |
| Dockerfile strace | PASS | `strace` (and `procps`) installed; verifier executes agent code (builds + runs `myld`), so strace is required and present. |
| test.sh /logs lockdown | PASS | First actions: `chmod 700 /logs/verifier` then `rm -rf "${VERIFIER_DIR:?}"/*`; lock-before-wipe order correct; EXIT trap guarantees a reward file. |
| test.sh strace wrapping | PASS | Every agent build/link/run wrapped in `strace -f` with `timeout`; log scanned for `openat()` of reward.txt/json with write flags; scoring runs after the strace fence. |
| Scoring imports /app | PASS | `compute_reward.py` only reads `/logs/verifier/test_results.json` and `/app/myld.c` as text; never imports or executes agent code. |

### Anti-Cheat Measures

**Privilege separation & input integrity**
- Agent build/link/run executed via `su agent ... env -i` with a fixed clean PATH, so agent code drops root and cannot touch root-owned files.
- Graded inputs (`.o`/`.a`, `start.o`, `syscalls.o`) staged from root-only `/tests/refdata` into a root-owned, agent-readable tmp dir (mode 644); agent gets only a writable `OUTDIR`, so it cannot swap link inputs.
- `.ref` reference binaries removed from agent-readable `/app/tests` and kept root-only in `/tests/refdata`; agent cannot read/anticipate expected outputs.
- Symlink guards (`[ -L "$act" ]` / `[ -L "$elf" ]`) on every graded artifact prevent the agent from pointing outputs at root-owned `.ref` files.

**Reward & process integrity**
- `/logs/verifier` and `/tests` re-locked to 700 at verifier start; environment sanitised (`unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH BASH_ENV CFLAGS CC ...`) to kill injection/preload side channels.
- `pkill -9 -u agent` before, between, and after agent jobs; survival check fails with `agent_processes_survived`; strace `-f` fence blocks until all descendants exit so no daemon races root grading.
- Scoreboard `test_results.json` written only by the root grading phase at a root-only path; agent code never runs during grading, so a malicious `myld`/ELF cannot self-mark all-pass.
- `reward.json`/`reward.txt` written atomically (tempfile + `os.replace`) so a reader never sees a half-written score.

**Source anti-gaming**
- `compute_reward.py` scans `/app/myld.c` for banned patterns (`system(`, `popen(`, `execvp("ld"/"gcc"/"musl-gcc"/"collect2")`) — prevents shelling out to the real toolchain — and enforces a 150 non-blank-line minimum; failure zeroes the entire reward.
- Oracle bypass requires the marker file `/app/.harbor_oracle_marker` to *contain* the secret `HARBOR_ORACLE_FLAG` token (not just exist), so a bare `touch` by the agent cannot disable the source gate.

**Scoring design**
- Five difficulty-weighted tiers (T1 0.08 → T5 0.40) reward partial progress proportionally while making trivial tiers worth little, so the bulk of reward demands real relocation/symbol-resolution work; output correctness is byte-diffed against root-run `.ref` binaries (stdout + exit code), and the whole score is hard-gated to 0 if the source anti-gaming check fails — keeping the unmodified baseline at exactly 0.

### Undefended attack surfaces

- **Makefile build redirection**: the agent owns `/app` including `Makefile`, and the verifier runs `make -C /app` as the agent. The source gate inspects only `/app/myld.c`. The agent can keep a benign 150-line `myld.c` while editing the Makefile (or adding another `.c`) to compile a *different* source that calls `ld`/`gcc` into the `myld` binary — passing the banned-pattern gate while still shelling out to the real toolchain. No Makefile/auxiliary-source integrity check exists.
- **Banned-pattern gate is trivially evadable**: checks are literal substrings of fixed `execvp("ld")` spellings; the agent can invoke the real linker via `execv`/`execve`/`posix_spawn`, build the `"ld"` string at runtime, or exec `/usr/bin/ld` by absolute path — none of which match the patterns, so cheating source survives the gate.

**Verdict: FAIL**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Reward is pass-fraction sum; anti-gaming gate zeros all if banned patterns/stub detected |
| Test quality | PASS | 16 graded checks across 5 tiers; real run-diff vs reference binaries + readelf structural gates |
| Determinism | PASS | Test programs emit fixed output; graded by diff vs root-owned `.ref` binaries; no random/time |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | FAIL | Verifier audit found critical gaps (see Anti-Cheat section). Fix before running rollouts. |
| Baseline reward | PASS | Stub myld.c compiles but emits no ELF → all tiers fail → 0.0 |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | Makefile + stub myld.c compile out of box; `make` works; musl CRT/libc at documented path |
| Instruction ↔ workspace | PASS | musl-tools, build-essential, readelf/objdump (binutils) installed; paths match instruction |
| Reference docs | PASS | Instruction points to `<elf.h>`, readelf/objdump; ELF is well-documented — no extra docs needed |

### Notes

- **job.yaml timeout (WARN)**: `sandbox_timeout_secs: 9000` is below the Modal guideline of `agent_timeout + verifier_timeout + 1800` (9600). Risk of sandbox teardown before verification on a full-length run; raise to ≥9600.
- **No timeout hint (WARN)**: instruction does not tell the agent its session ends after a fixed window. Low impact here since the verifier rebuilds from `myld.c` (no fragile artifact to keep fresh), but a one-line hint would help the agent pace iteration.
- **Unpinned apt packages (WARN)**: base image `python:3.13-slim` plus unpinned `build-essential`/`musl-tools` could drift across rebuilds; acceptable for a self-contained C task but pinning improves reproducibility.

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
| Total cost | $4.58 |
| Oracle reward | 1.0000 (job: 2026-06-09__12-43-40) |

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 0/2 (0%) | 0.0000 | 2.00h | $2.29 |
| **Overall** | **2** | **0/2 (0%)** | **0.0000** | **2.00h** | **$2.29** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| DKvXQXn | 0.0000 | 2.00h | $2.37 | Timed out; stub never replaced (8 LOC, gate failed) | Reverse-engineered ELF/relocation/musl details for 15 episodes; never wrote linker |
| LMhaJvu | 0.0000 | 2.00h | $2.21 | Timed out; stub never replaced (8 LOC, gate failed) | Pure ELF/musl research across 23 episodes; never wrote any linker code |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 2/2 FAIR |
| Infrastructure failures | None — 2h timeout is a legitimate agent outcome |
| Task fairness issues | None — task is hard, not broken |
| False negatives | None — both left the original stub, no real linker written |
| False positives | None |
| Reward hacking attempts | None |
| Verifier quality issues | None |
| Verifier timeout buffer | OK — oracle verifier ran ~12s vs 600s limit (>50x) |
<!-- END:ROLLOUT_RESULTS -->
