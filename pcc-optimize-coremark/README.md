# PCC CoreMark Code-Generation Optimization

> The agent must improve the runtime speed of code emitted by PCC (the Portable C Compiler) — specifically its CoreMark benchmark output — by editing PCC's C source and rebuilding it with a frozen bootstrap compiler. The domain is compiler code-generation (C); the core challenge is making generated code faster without breaking correctness, in an air-gapped image with no GCC/Clang available to cheat with.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | compiler-optimization |
| Agent Timeout | 2 hours |
| Verifier Timeout | 40 minutes |
| Internet Access | Disabled |
| CPUs / Memory | 4 CPUs / 8192 MB (20 GB storage) |

---

## Pre-Rollout QA

> Automated analysis + manual review of task definition before any compute is spent on rollouts.

### Structure & Format

| Check | Status | Detail |
|-------|--------|--------|
| Required files | PASS | instruction.md, task.toml, environment/Dockerfile, tests/test.sh all present |
| task.toml | PASS | allow_internet=false; agent 7200s (justified for full compiler rebuild loop); verifier 2400s; build 1200s; user="agent" |
| Dockerfile | PASS | git+tmux+strace installed; multi-stage (GCC only in builder, absent at runtime); apt cleaned; no pinned apt versions (WARN below) |
| reward.json schema | PASS | Writes score, reward, subscores list, additional_data; no splatted top-level keys; reward.txt written |
| Oracle solution | PASS | solve.sh patches PCC driver to delegate to bundled gcc-12 -O3; paths consistent; debs in solution/ (not in image) |
| oracle.yaml / job.yaml | PASS | Both present at task level |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Exact rebuild/test commands given; goal unambiguous; matches verifier (rebuild from /app/compiler-src, CoreMark speedup) |
| Scoring leakage | PASS | No score/reward/verifier terms in instruction or agent-visible workspace (2.59 hits are coincidental benchmark data) |
| Tone & length | PASS | 55 lines, colleague-handoff tone; includes timeout/2-hour awareness hint |

### Reward Design

**Formula**: `gated_correctness × discrete_speedup_steps(modified_coremark / baseline_coremark)`

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| Output validation | CoreMark self-CRC (list/matrix/state) byte-matches golden baseline | Hard gate → 0.0 if mismatch (fast-but-miscompiled blocked) |
| Correctness | Full torture+LLVM suite regressions vs baseline PCC | Hard gate → 0.0 if any regression |
| Noise floor | Speedup ≤ 1 + 3·(stdev/median), min 1.05x | Sub-floor speedup → 0.0 |
| Speedup | Geomean CoreMark throughput vs baseline | Discrete steps: 0.1 at 1.05x → 1.0 at ≥2.59x (GCC -O3 parity) |

**Design rationale**: Correctness is enforced by two independent hard gates before any speed credit — a deterministic, iteration-independent CoreMark self-CRC match (catches miscompiled-but-fast output) and a regression check against the baseline suite. The variance-derived noise floor prevents measurement jitter from scoring. Discrete speedup steps are calibrated against GCC -O3 (~2.59x faster than PCC -O) as the reward=1.0 ceiling, so partial credit reflects genuine, meaningful code-gen improvement.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` set (task.toml). |
| Dockerfile user setup | PASS | `useradd agent`; `chown -R agent:agent /app`; `mkdir /tests && chmod 700 /tests`; `mkdir /solution && chown agent:agent /solution`. All four present. |
| Dockerfile strace | PASS | `strace` installed; required because the verifier rebuilds and runs agent-controlled compiler/benchmark code during verification. |
| test.sh /logs lockdown | PASS | First actions: `mkdir -p`, `chmod 700 "$VERIFIER_DIR"`, then `rm -rf "${VERIFIER_DIR:?}"/*` — lock-before-wipe in correct order. Also re-locks `/tests` to 0700 (Harbor's upload resets it to 0755). |
| test.sh strace wrapping | PASS | Modified build + CoreMark run wrapped in `strace -f -e trace=clone,...,openat` with `timeout 1700`; reward computed in a separate step after strace exits. |
| Scoring imports /app | PASS | `compute_reward.py` only reads CSV/sidecar files via `argparse`+`csv`; run as `python3 -ISs` (isolated, no env/site/user paths). No `/app` imports. |

### Anti-Cheat Measures

**Privilege separation & build integrity**
- Agent's modified PCC is built and its CoreMark binary is run as the unprivileged `agent` user via `su agent` with `env -i PATH=<safe> HOME TMPDIR` — agent code never executes as root, so it cannot touch root-owned outputs.
- Baseline (golden) PCC is built/benchmarked as root from the root-only `/tests/baseline-pcc` tree **before any agent code runs**, so the agent cannot tamper with the comparison baseline or the golden CRCs.
- Capture files, result CSVs, and validation sidecars are root-owned and root-written; the dropped agent process only produces binaries, preventing result forgery. Pristine benchmark/script trees are re-copied per phase (`/tmp/pristine_*`) so agent edits to `/app` scripts are ignored.

**Toolchain / cheat prevention**
- GCC/Clang/LLVM presence ban (`is_disallowed_c_compiler`) checks PATH name, resolved symlink, and `--version` output for gcc/g++/clang/cc — prevents the agent from delegating compiles to a real optimizing compiler instead of improving PCC.
- Multi-stage Dockerfile ships **no** gcc/cc in the runtime image and verifies its absence twice at build, so the only compiler available is the PCC bootstrap.
- Environment sanitization unsets `LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH BASH_ENV ENV CFLAGS CC CXX MAKEFLAGS` — blocks loader/build-config side channels that could alter what the verifier builds.

**Reward-file & process integrity**
- strace `openat()` scan greps for `reward.(txt|json)` opened `O_WRONLY|O_RDWR|O_CREAT` during the agent window; any hit -> `fail_with reward_file_manipulation`. Catches forked/background writers that inherit privileges.
- Pre-verification `pkill -9 -u agent` (with retry + escalation to `agent_processes_survived` fail) kills stray agent background processes before scoring; `/logs/verifier` 0700 wall blocks late writes during the post-strace correctness loop.
- `reward.json`/`reward.txt` written atomically (tempfile + `os.replace`) so a crash never leaves a torn reward; test.sh always `exit 0`.

**Output-validation correctness gate**
- A fast-but-miscompiled CoreMark scores 0: the modified run must self-validate (`crc_ok=1`) AND byte-match the baseline golden list/matrix/state CRCs. CRCs are deterministic for fixed seeds and iteration-independent, so a correct compiler always reproduces them regardless of speed. Enforced in both test.sh and `compute_reward.py` (defense-in-depth). `crcfinal` is intentionally excluded (it varies with auto-calibrated iteration count).
- gcc.c-torture / LLVM correctness regression gate: any test the baseline passed but modified failed forces reward 0.

**Scoring design**
- Reward = geomean speedup of modified vs baseline PCC, mapped to discrete steps (0.1 per band, 1.0 at ~2.59x = GCC -O3 parity). Discrete bands + a variance-derived noise floor (`1 + 3*stdev/median`, clamped >=1.05) ensure measurement jitter cannot produce a nonzero score, and an unmodified baseline scores exactly 0.0. Gates (validation, CRC, correctness) are hard zeros applied before any speedup credit, so speed never offsets incorrectness.

**Undefended attack surfaces**
- None material. The threat model (agent edits PCC source) is fully contained: agent code runs unprivileged under strace, baseline/golden values are root-established pre-agent, results are root-captured, and the CRC + correctness gates block the obvious "fast but wrong" path.

**Acknowledged gaps**
- Oracle token path (test.sh) relaxes ONLY the GCC/Clang-presence ban when `/app/.harbor_oracle_marker` matches the secret `pcc-839a70119de3d155` (injected via `[solution.env]`, never seen by the agent); all correctness/CRC/speedup gates still apply. The token is random and agent-invisible, so it is not forgeable.
- Modified correctness loop runs outside strace (test.sh comment: avoids a multi-GB trace of ~1900 compiles); justified because reward files are root-only 0700 during that window and the load-bearing correctness wall is the root-captured CoreMark CRC gate, not this regression CSV.

**Verdict: PASS**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Two hard gates (CRC match + zero regressions) before speedup counts; not a weighted blend |
| Test quality | PASS | ~1897 gcc-torture execute + ~774 LLVM UnitTests correctness; real upstream suites, not synthetic |
| Determinism | PASS | CoreMark fixed seeds (time-independent CRCs); 5 measured runs + warmup, median, variance noise floor |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | PASS | No meaningful gaps found |
| Baseline reward | PASS | Unmodified source ⇒ speedup ≈ 1.0 ≤ noise floor ⇒ reward 0.0 |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | PCC source + pcc-bootstrap build out of box; exec bits restored on autotools scripts |
| Instruction ↔ workspace | PASS | All referenced paths/scripts present; no missing tools (bison/flex/make for rebuild installed) |
| Reference docs | PASS | CoreMark README/docs + benchmark scripts in workspace; PCC is a niche tool but source is self-documenting |

### Notes

- Dockerfile apt packages are not version-pinned (WARN). Reproducibility risk is low since base is pinned `ubuntu:22.04` and no internet at runtime, but pinning would harden long-term rebuilds.
- `.gitignore` still references TCC build artifacts (this task was forked from a TCC variant). Cosmetic only — does not affect PCC build or scoring.
- Verifier maintains a separate hardened copy of `benchmark_suite.sh`/`correctness_tests.sh` in `tests/` (CRC validation, multi-run median, `--exec-as`) distinct from the simpler agent-facing copy in `environment/scripts/`. CSV columns (`suite`, `benchmark`, `status`, `runtime_sec`) match what compute_reward.py consumes.

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
| Total cost | $29.36 |
| Oracle reward | 0.7000 (job: 2026-06-09__12-08-45) — WARNING: expected >= 0.9, verifier may have issues |

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 0/2 (0%) | 0.0000 | 1h 41m | $14.68 |
| **Overall** | **2** | **0/2 (0%)** | **0.0000** | **1h 41m** | **$14.68** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| jpDkU39 | 0.0000 | 1h 35m | $16.98 | Below threshold (speedup=1.04x, floor=1.05x) | Correctness-first peephole/codegen tweaks in optim.c, order.c, table.c; +4.1% gain |
| Y64LnyK | 0.0000 | 1h 47m | $12.38 | Below threshold (speedup=1.00x, reverted to baseline) | Loop-rotation pass in optim2.c; measured ~2% regression, reverted and shipped baseline |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 2/2 FAIR |
| Infrastructure failures | None |
| Task fairness issues | None — task is hard, not broken |
| False negatives | None |
| False positives | None |
| Reward hacking attempts | None — strace confirmed zero reward-file writes |
| Verifier quality issues | 1 LOW: discrete scoring discards verified sub-5% gains (design preference, not a defect) |
| Verifier timeout buffer | OK — oracle verifier ~566s vs 2400s limit (~4.2x) |
<!-- END:ROLLOUT_RESULTS -->
