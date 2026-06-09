# TCC Heapsort Codegen Optimization

> The agent modifies the Tiny C Compiler (TCC) source in `/app/compiler-src/tcc/` to make the code it generates run faster, scored on the speedup of the LLVM `heapsort` benchmark binary versus an unmodified baseline TCC. C / compiler-codegen domain. The core challenge: improve TCC's own code generation without regressing correctness, while self-hosting through a GCC-free TCC bootstrap compiler.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | compiler-optimization |
| Agent Timeout | 2 hours |
| Verifier Timeout | 30 minutes |
| Internet Access | Disabled |
| CPUs / Memory | 4 CPUs / 8192 MB (20480 MB storage) |

---

## Pre-Rollout QA

> Automated analysis + manual review of task definition before any compute is spent on rollouts.

### Structure & Format

| Check | Status | Detail |
|-------|--------|--------|
| Required files | PASS | instruction.md, task.toml, environment/Dockerfile, tests/test.sh all present |
| task.toml | PASS | allow_internet=false; agent 7200s (justified — full TCC rebuild + suites + iteration); verifier 1800s; build 900s; agent.user="agent" |
| Dockerfile | WARN | git, tmux, strace, make present; multi-stage builder (GCC) → GCC-free runtime; apt cleaned; deps unpinned (no version pins, no lockfile); ~35MB benchmark suites copied |
| reward.json schema | PASS | Writes score, reward, subscores list, additional_data dict via emit_reward; no splatted top-level keys; reward.txt written |
| Oracle solution | PASS | solve.sh complete; extracts bundled gcc-debs, patches tcc.c to delegate to gcc -O3, rebuilds; paths consistent with Dockerfile/task.toml token |
| oracle.yaml / job.yaml | PASS | Both present at task level |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Unambiguous; exact rebuild/test commands given; no contradiction with verifier (full correctness suite, heapsort speedup) |
| Scoring leakage | WARN | Line 3 states "Your score is based entirely on how much faster the heapsort binary runs … any new test failures gate the reward to zero" — reveals gating + metric. No formula/thresholds (1.40x, noise floor) leaked. Domain-appropriate but could be softened |
| Tone & length | PASS | 45 lines, colleague-handoff tone, commands fenced |

### Reward Design

**Formula**: `correctness_gate AND output_gate, then linear-scaled heapsort speedup`

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| Correctness | Full torture+llvm suite (~2568 tests); any baseline-PASS that modified does not PASS (incl. missing rows) = regression | HARD gate → reward 0 on any regression |
| Output validation | Modified heapsort stdout byte-matches baseline-computed golden | HARD gate → reward 0 on mismatch/missing/symlink |
| Speedup | Median of interleaved per-iteration baseline/modified time ratios | Below noise floor → 0; linear ramp to full reward at 1.40x; clamped [0,1] |

**Design rationale**: Correctness and output gates are hard prerequisites — a compiler that miscompiles heapsort "fast" or regresses any test scores 0, so speed is only rewarded for genuinely correct codegen. The noise floor (max of 1.05x and a baseline-variance band, `1 + 2·cv`) prevents timing jitter from registering as improvement; the 1.40x full-reward target sets a meaningful codegen-improvement bar.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` set (task.toml). |
| Dockerfile user setup | PASS | `useradd agent`; `chown -R agent:agent /app`; `mkdir -p /tests && chmod 700 /tests`; `mkdir -p /solution && chown agent:agent /solution`. All present. |
| Dockerfile strace | PASS | `strace` installed; required because the verifier builds and executes the agent's modified TCC. |
| test.sh /logs lockdown | PASS | `chmod 700 "$VERIFIER_DIR"` first, then `rm -rf "${VERIFIER_DIR:?}"/*` as the first prologue actions. |
| test.sh strace wrapping | PASS | Agent phase runs under `strace -f -e trace=clone,...,openat` with `timeout "$STRACE_TIMEOUT"`; scoring (`compute_reward.py`) runs as a separate step after the strace block, after the reward-tamper scan. |
| Scoring imports /app | PASS | `compute_reward.py` run via `python3 -ISs`; reads only CSV/text/golden files, imports nothing from `/app`. |

### Anti-Cheat Measures

**Compiler-substitution prevention**
- Two-stage Dockerfile builds TCC with GCC then ships a runtime image with NO gcc/g++/cc (build-time `! command -v gcc` assertions); prevents the agent from secretly delegating compilation to a real optimizing compiler.
- Step 0 `is_disallowed_c_compiler` resolves each of gcc/g++/clang/clang++/cc by path, symlink target, and `--version` banner (matches gcc/clang/llvm); blocks a smuggled/renamed optimizing compiler placed on PATH.

**Privilege & workspace isolation**
- Baseline TCC, golden heapsort output, and timing CSV are built/computed as root BEFORE the agent phase into root-only `/tmp/harbor_verifier_root` (`chmod 700`, golden `chmod 600`); the agent cannot read or tamper the reference or scores.
- Every agent-built artifact (modified TCC, its correctness run, its heapsort binary) executes as the `agent` user via `su agent -s /bin/bash -c "env -i PATH=... $*"`; result/golden dirs are excluded from `env -i`, so an emitted binary cannot locate or overwrite them as root.
- Pristine heapsort source + correctness scripts are copied root-owned (`a+rX`, not writable) from root-only `/tests`, so the agent cannot edit the scored benchmark or the test harness.

**Reward-tamper detection (runtime)**
- `/logs/verifier` locked (`chmod 700`) then wiped before anything runs; pre-existing agent processes are `pkill -9`'d (with retry + `agent_processes_survived` fail) so no planted reward survives.
- Post-strace scan greps the strace log for `openat(...reward.(txt|json)...O_WRONLY|O_RDWR|O_CREAT)` and fails with `reward_file_manipulation`; catches a forked agent process opening reward files during verification.
- Modified-correctness CSV and modified heapsort stdout are read by `cat` AS the agent into root-only files, so a symlink to a root-only path is denied (empty -> treated as regression / output-gate fail) rather than redirecting a root read.

**Scoring design**
- Reward = correctness gate AND output gate, scaled by speedup. Correctness gate is HARD: any test baseline PASSes but modified does not (incl. missing rows) -> reward 0, so the agent cannot hide a miscompile-induced regression by deleting CSV rows.
- Output gate is HARD: modified heapsort stdout must byte-match the root-computed golden (symlinked/missing output rejected), blocking the "miscompile heapsort to be artificially fast" attack.
- Speedup uses median of interleaved per-iteration baseline/modified ratios (interleaving cancels machine drift), with a noise floor `max(1.05, 1+2*cv)` derived from baseline variance and linear ramp to full reward at 1.40x; the variance-derived floor prevents jitter from scoring as a real speedup, and the unmodified baseline scores exactly 0 (ratio ~1.0 <= floor).
- Oracle-only correctness-gate bypass is gated behind the unforgeable `[solution.env]` token written to `/app/.harbor_oracle_marker`; output gate and speedup stay enforced even for the oracle, and a normal agent cannot forge the token.

### Undefended attack surfaces

(none of material impact — isolation is sound, all scored references are root-only and computed before agent code runs, and runtime forks are strace-fenced)

### Acknowledged gaps

- `/logs/agent/` is not locked (per Harbor model the agent can tamper its own traces); not used for scoring here, so no impact. The verifier relaxes `/logs/verifier` to 755/644 only AFTER scoring completes and all agent processes are dead (strace fence + pre-kill), documented inline as safe.

**Verdict: PASS**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Hard gate: any regression → reward 0; gated before output/speedup; missing-row counts as regression |
| Test quality | PASS | Real-world suites: ~1897 gcc-torture + ~671 llvm UnitTests; verifier runs FULL suite (no --quick) |
| Determinism | PASS | heapsort uses fixed-seed PRNG (seed=42), no rand input; interleaved timing + 3 warmups + ≥5 median; output gate byte-exact |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | PASS | No meaningful gaps found |
| Baseline reward | PASS | baseline-tcc == unmodified compiler-src; no change → speedup ~1.0x ≤ noise floor → reward 0.0 |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | Dockerfile builds + self-hosts TCC at build time; configure exec-bit restored; agent rebuilds via documented commands |
| Instruction ↔ workspace | PASS | tcc-bootstrap, scripts, benchmarks, libc6-dev, make, numdiff, bc all installed; gcc absent by design (verified in image) |
| Reference docs | PASS | TCC source tree (README/Changelog/Makefile) present; commands embedded in instruction; heapsort source in workspace |

### Notes

- **Scoring leakage (WARN, accepted)**: The instruction names "score", "speedup", and the correctness "gate". Since this is a performance-optimization task, telling the agent the objective (make heapsort faster, don't regress) is the task spec itself. No reward formula, thresholds, or verifier internals are exposed — acceptable, but the gating language could be reworded.
- **Unpinned deps (WARN, accepted)**: apt packages and TCC source are unpinned. The base image `ubuntu:22.04` is reasonably stable and TCC source is vendored in-tree, but pinning apt versions and recording the TCC commit would improve reproducibility.
- The agent-facing `benchmark_suite.sh` differs from the verifier's copy (min-of-N vs the verifier's own interleaved median timing). This is fine — the verifier does not use the agent's script for scoring; it is only an iteration aid.
- `.dockerignore` absent; build context is small and clean, so no impact.

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
| Total cost | $27.49 |
| Oracle reward | 1.0000 (job: 2026-06-09__12-08-47) |

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 0/2 (0%) | 0.0000 | 1h51m | $13.75 |
| **Overall** | **2** | **0/2 (0%)** | **0.0000** | **1h51m** | **$13.75** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| GWoDwDG | 0.0000 | 1h42m | $12.80 | Below threshold (speedup=0.94x, floor 1.10x) | Added LEA-fusion peephole to x86-64 backend; correct but perf-neutral |
| RqEd74a | 0.0000 | 2h00m | $14.69 | Below threshold (speedup=0.98x, floor 1.08x); agent timed out | Profiled hot loop, added guarded sxtw/scaled-LEA peepholes; correct but perf-neutral |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 2/2 FAIR |
| Infrastructure failures | None |
| Task fairness issues | None |
| False negatives | None |
| False positives | None |
| Reward hacking attempts | None — both pursued legitimate codegen optimization |
| Verifier quality issues | None — one LOW note on timing measurement variance |
| Verifier timeout buffer | OK — oracle verifier ~423s vs 1800s timeout (~4.3x) |
<!-- END:ROLLOUT_RESULTS -->
