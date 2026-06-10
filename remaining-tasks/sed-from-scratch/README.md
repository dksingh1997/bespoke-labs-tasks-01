# Implement a `sed` Clone in C

> The agent must build a from-scratch clone of the GNU `sed` stream editor as a single `mysed.c` file in C (compiled via a provided Makefile). It must support the full CLI (`-n/-e/-f/-i`), addressing, substitution, hold space, branching, multi-line commands, in-place editing, and POSIX BRE regex — without calling any existing sed or using `system()`/`popen()`. The core challenge is correctly reimplementing sed's complex execution model and regex semantics.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | systems-programming |
| Agent Timeout | 2 hours |
| Verifier Timeout | 15 minutes |
| Internet Access | Disabled |
| CPUs / Memory | 2 CPUs / 4096 MB |

---

## Pre-Rollout QA

> Automated analysis + manual review of task definition before any compute is spent on rollouts.

### Structure & Format

| Check | Status | Detail |
|-------|--------|--------|
| Required files | PASS | instruction.md, task.toml, environment/Dockerfile, tests/test.sh all present |
| task.toml | PASS | allow_internet=false, agent 7200s, verifier 900s, build 600s, user="agent" |
| Dockerfile | PASS | git+tmux+strace installed, build-essential for gcc/make, slim base, apt cleanup |
| reward.json schema | PASS | Writes score, reward alias, subscores list, additional_data; reward.txt too |
| Oracle solution | PASS | solve.sh writes marker + thin `/usr/bin/sed` execvp wrapper, runs `make` in /app |
| oracle.yaml / job.yaml | PASS | oracle.yaml, oracle_local.yaml, job.yaml all present at task level |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Unambiguous: single mysed.c, `make`, match GNU sed; points to sed_reference.txt |
| Scoring leakage | PASS | No scoring/reward/tier wording in instruction or workspace reference doc |
| Tone & length | PASS | Natural colleague handoff tone; 12 lines instruction, 230-line reference doc |

### Reward Design

**Formula**: `(Σ tier_pass_rate × tier_weight) × source_integrity_penalty`

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| t1 Basic Commands | fraction of tier tests passing | weight 0.03 |
| t2 Addressing & Escaping | fraction passing | weight 0.05 |
| t3 Substitution Features | fraction passing | weight 0.07 |
| t4 Hold Space & Multi-line | fraction passing | weight 0.10 |
| t5 Complex Scripts & File I/O | fraction passing | weight 0.15 |
| t6 Edge Cases & Programs | fraction passing | weight 0.25 |
| t7 Stress Tests | fraction passing | weight 0.35 |
| source integrity | mysed.c >=50 non-blank lines, no `system`/`popen`/sed-exec | multiplier: 1.0 pass, else 0.1 |

**Design rationale**: Weights are back-loaded (t6+t7 = 60%) so the reward tracks genuinely hard sed semantics (regex edge cases, stress scripts) rather than trivial substitutions. The source-integrity multiplier (0.1) collapses the score of any submission that shells out to real sed or is a stub — it complements the strace execve tripwire that hard-zeroes runtime cheating. Reward is pure correctness; there is no speed dimension to game.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` set (task.toml). |
| Dockerfile user setup | PASS | `useradd agent`; `chown -R agent:agent /app`; `mkdir -p /tests && chmod 700 /tests`; `mkdir -p /solution && chown agent:agent /solution`. |
| Dockerfile strace | PASS | `strace` installed; needed — verifier compiles and runs agent's C binary (`make`, `/app/mysed`). |
| test.sh /logs lockdown | PASS | First filesystem action: `mkdir -p`, `chmod 700 $LOGDIR`, then `rm -rf "${LOGDIR:?}"/*` — lock-then-wipe ordering correct. |
| test.sh strace wrapping | PASS | Build and run passes each wrapped in `strace -f` with `timeout`; logs analyzed for execve/reward tripwires before scoring; `compute_reward.py` runs after, outside strace. |
| Scoring imports /app | PASS | `compute_reward.py` only parses `test_results.txt` and reads `/app/mysed.c` as text — never imports or executes agent code. |

### Anti-Cheat Measures

**Golden-output isolation**
- GOLD outputs generated live from `/usr/bin/sed` into a root-only `mktemp -d` (`chmod 700`); agent stage gets only `.sed`/`.inp` inputs (never `.good`/golden) — prevents the agent reading expected answers or hardcoding outputs.
- `/tests` re-locked to `chmod 700` first thing in test.sh (undoes Harbor's verify-upload 0755 reset), so the agent UID gets EACCES on `/tests/gnu_suite/*.good` during its phase — blocks reference leakage.

**External-exec tripwires (shell-out detection)**
- Run-phase strace scanned for explicit `execve("/usr/bin/sed"|"/bin/sed")` — catches direct invocation of the system sed.
- Closed allow-set (`run_exec_allowed`): only `/app/mysed` + a fixed basename list (su/env/bash/timeout/unix_chkpwd/mkdir/tr/cp/cat/seq/head) inside system bin dirs is permitted; any other successful execve (e.g. `cp /usr/bin/sed /tmp/x; exec /tmp/x`, or exec'ing perl/awk/python) zeroes the reward — defeats copy-and-shell-out and interpreter-emulation cheats.
- Failed/PATH-probe execs (`= -1`) ignored; build-phase compiler execs isolated into a separate strace log never scanned — avoids false positives.

**Source-integrity gate (compute_reward.py)**
- `anti_gaming_penalty` reads `/app/mysed.c`: `<50` non-blank lines → 0.1x multiplier (blocks thin wrapper stubs); banned-token scan (`system(`, `popen(`, `"/usr/bin/sed"`, `execvp("sed"`, etc.) → 0.1x — prevents shelling out via static source inspection.

**Reward-file & process integrity**
- Lock-then-wipe `/logs/verifier`; strace logs scanned for `openat(...reward.(txt|json)...O_WRONLY|O_RDWR|O_CREAT)` → `reward_file_manipulation` fail; reward written atomically via `mkstemp`+`os.replace`.
- `pkill -9 -u agent` (with retry + `agent_processes_survived` hard-fail) kills leftover agent processes before verification; env sanitized (`unset LD_PRELOAD LD_LIBRARY_PATH CC CFLAGS ...`); agent run under `env -i` with a fixed PATH — neutralizes LD_PRELOAD, compiler-flag, and PATH-hijack vectors.

**Oracle marker (forgery-resistant)**
- Oracle bypass of source/execve gates requires the marker file to *contain* the secret `HARBOR_ORACLE_FLAG` (injected only via `[solution.env]`), not merely exist — a bare `touch` by the agent fails since it never sees the token.

**Scoring design**
- Weighted 7-tier reward (t1=0.03 … t7=0.35) rewards depth: trivial substitutions yield little, real engine features (hold space, branching, multi-line, stress) dominate — discourages cheap partial-credit gaming. Anti-gaming multiplier is a *gate* (1.0 or 0.1), so a detected stub/shell-out collapses the entire weighted sum rather than docking a fraction. GOLD generated by the same live oracle the agent is graded against guarantees an unmodified baseline (build fails / stub) scores ~0.

### Undefended attack surfaces

- None material. The closed-set execve allow-list plus source banned-token gate plus live-oracle golden isolation comprehensively cover the domain's primary cheat (delegating to real sed); reward/process/env tampering is locked down.

**Verdict: PASS**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Reward = weighted pass-rate × integrity multiplier; no free non-correctness score |
| Test quality | PASS | ~124 cases: real GNU sed suite (.sed/.inp/.good) + custom CLI/in-place/stress tests |
| Determinism | PASS | Fixed inputs, LC_ALL=C, golden generated by live `/usr/bin/sed`; no random seeds |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | PASS | No meaningful gaps found |
| Baseline reward | PASS | Stub mysed.c builds but fails all cases → raw 0; also <50 lines → 0.0 |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | Makefile + stub mysed.c compile out of the box via `make` |
| Instruction ↔ workspace | PASS | Only gcc/make/sed needed, all installed; `/usr/bin/sed` available as reference |
| Reference docs | PASS | 230-line sed_reference.txt covers CLI, addressing, regex, hold space, branching |

### Notes

- `job.yaml` sets Modal `sandbox_timeout_secs: 9000`, but agent (7200) + verifier (900) + 1800 = 9900. This is below the recommended Modal margin; consider raising to >=9900 to avoid sandbox teardown before verification completes. WARN — does not block, and oracle.yaml uses a short-lived oracle run.
- Golden outputs are generated live from `/usr/bin/sed` at verify time rather than committed `.good` files for custom cases, ensuring the oracle ceiling matches the installed sed version.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

### Overview

| Metric | Value |
|--------|-------|
| Trials | 2 (0 scored, 2 infra failures) |
| Models tested | 1 |
| Overall success rate | 0/0 (n/a — no scored trials) |
| Mean reward | — |
| Reward range | — |
| Total cost | $0.05 |
| Oracle reward | 1.0000 (job: 2026-06-09__12-43-30) |

> Both trials aborted on an Anthropic LLM API connection timeout (600s) during the 3rd episode, before any code was written or the verifier ran. No trial produced a reward.

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 0/0 (n/a) | — | 90.7 min | $0.02 |
| **Overall** | **2** | **0/0 (n/a)** | **—** | **90.7 min** | **$0.02** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| 2B6bcq5 | — | 90.7 min | $0.03 | Infrastructure failure (LLM API timeout) | Read workspace/Makefile/reference; hung on 3rd LLM call, no code written |
| udHC3u5 | — | 90.7 min | $0.02 | Infrastructure failure (LLM API timeout) | Explored (ls, Makefile, reference) then aborted on repeated 600s API timeout |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 0/2 FAIR (2 INFRASTRUCTURE_FAILURE) |
| Infrastructure failures | 2 — job-wide Anthropic API connection timeouts; no trial reached the verifier |
| Task fairness issues | None — agents never got past exploration due to API outage |
| False negatives | None — no rewards were assigned |
| False positives | None |
| Reward hacking attempts | None — stub mysed.c left untouched in both trials |
| Verifier quality issues | None — verifier never ran; failure is upstream LLM connectivity |
| Verifier timeout buffer | OK — oracle verifier ~20s vs 900s limit (>=2x) |
<!-- END:ROLLOUT_RESULTS -->
