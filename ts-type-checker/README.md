# Build a TypeScript Type Checker from Scratch

> The agent must extend a starter Node.js checker (`/app/checker/tscheck`) into a real static type checker that parses `.ts` files with `@babel/parser` and reports TypeScript-compatible diagnostics (TS2322, TS2339, TS2345, TS2554, TS2304, etc.) on the correct line/code with a faithful message. The core challenge is implementing a type system (assignability, property resolution, call/arg checking, control-flow) without `tsc` or the `typescript` package. Ground truth is the real TypeScript compiler's baseline output.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | very_hard |
| Category | programming |
| Agent Timeout | 2 hours |
| Verifier Timeout | 2 hours |
| Internet Access | Disabled |
| CPUs / Memory | 4 CPUs / 8192 MB |

---

## Pre-Rollout QA

> Automated analysis + manual review of task definition before any compute is spent on rollouts.

### Structure & Format

| Check | Status | Detail |
|-------|--------|--------|
| Required files | PASS | instruction.md, task.toml, environment/Dockerfile, tests/test.sh all present. |
| task.toml | PASS | allow_internet=false; agent 7200s (justified by very_hard compiler task); verifier 7200s; build 1200s; agent.user="agent". |
| Dockerfile | WARN | git+tmux+strace present; babel pinned to `^7` (range, not exact); apt packages unpinned; no lockfile. Cleans apt lists; base node:20-slim. |
| reward.json schema | PASS | score, reward(alias), subscores list, additional_data dict; no stray top-level keys; reward.txt also written atomically. |
| Oracle solution | PASS | solve.sh present, complete; writes oracle marker first, builds answer-key-reading checker; paths correct. |
| oracle.yaml / job.yaml | WARN | Both present at task level. job.yaml `sandbox_timeout_secs: 9000` < agent(7200)+verifier(7200)+1800; oracle 5400 fine (oracle is fast). |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Output format, directives, constraints, evaluation all clear; no contradiction with verifier. |
| Scoring leakage | PASS | Describes "hidden/canary tests" and match semantics (acceptable) — no reward formula, weights, or verifier internals leaked. |
| Tone & length | PASS | Colleague-style handoff; 117 lines; points to workspace docs (lib/, starter, sample tests). |

### Reward Design

**Formula**: `canary_gate(100%) THEN id_rate × non_id_rate`

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| Canary gate | 7 canary files match exactly on (line, code) | Hard gate: <100% ⇒ score 0.0 |
| id_rate | Clean (0-error) hidden files with no spurious diagnostics | Multiplicative factor |
| non_id_rate | Error hidden files matching all expected diagnostics, no extras, on (file,line,kind)+code+message_substr | Multiplicative factor |

**Design rationale**: The canary gate forces a checker to demonstrate the four fundamental capabilities (TS2322/TS2304/TS2339/TS2554) before any score counts, blocking partial/no-op submissions. Multiplying id_rate × non_id_rate punishes both failure modes: a silent no-op gets id_rate=1.0 but non_id_rate=0.0 ⇒ 0.0, while an error-spraying checker tanks id_rate. This rewards precision in both directions.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` set; agent runs non-root. |
| Dockerfile user setup | PASS | Renames stock node user to `agent` (keeps UID 1000 for bind-mount writes), `chown -R agent:agent /app`, `mkdir -p /tests && chmod 700 /tests`, `mkdir -p /solution && chown agent:agent /solution`. |
| Dockerfile strace | PASS | `strace` installed; needed — verifier executes the agent's `/app/checker/tscheck` during verification. |
| test.sh /logs lockdown | PASS | First actions: `chmod 700 "$VERIFIER_DIR"` then `find ... -delete` to wipe; also re-applies `chmod 700 /tests` after Harbor's upload resets it to 0755. |
| test.sh strace wrapping | PASS | Checker run under `strace -f -e trace=clone,fork,execve,openat` with `timeout 120`/`2700`; scoring (`compute_reward.py`) runs as a separate step AFTER strace exits and tripwire analysis. |
| Scoring imports /app | PASS | `compute_reward.py` invoked `python3 -ISs` (isolated, no site-packages/env); imports only stdlib; reads only root-owned captured stdout + answer keys; never imports from `/app`. |

### Anti-Cheat Measures

**Answer-key isolation**
- Checker runs AS `agent` under `env -i` with `/tests` at mode 0700 root-only and only `.ts` inputs staged into a `mktemp -d` dir — agent gets EACCES on `expected.json`/`hidden_expected.json`, cannot read the answer key to fabricate output.
- Staged eval dirs are placed outside `/app` and `/tests`, owned `agent:agent` with `go-w`, and deleted immediately after the run — no persistent surface to plant or read.

**Real-compiler prevention**
- Static grep on `/app/checker/` blocks `child_process/exec/spawn ... \btsc\b`, `require('typescript')`, reward-file/log references, and `canary_cases/hidden_cases` references; defense-in-depth before any agent code runs.
- Runtime strace `execve` tripwire zeroes reward if the checker exec's the real `tsc`/`tsserver`/`typescript/bin|lib` — catches obfuscated shell-outs the static grep misses (whole-word anchors avoid matching `tscheck` or `@babel/node`).

**Corpus-lookup / weak-scoring defense**
- Hidden inputs are perturbed at authoring time (identifier rename + mid-file insertion) and re-oracled with real `tsc`; confirmed 0/1390 hidden files are byte-identical to any visible file, so memorizing the visible `.errors` corpus does not transfer.
- Hidden scoring is AND-match on (file,line,kind) AND code AND `message_substr`, with file passing only if every expected diagnostic matches AND there are zero extra diagnostics — a spray-everything or stay-silent checker both fail.

**Runtime / reward-file protection**
- `pkill -9 -u agent` (with retry + abort gate) before staging kills surviving agent background processes from the agent phase; env sanitisation unsets `NODE_OPTIONS/LD_PRELOAD/LD_LIBRARY_PATH/PYTHONPATH/BASH_ENV/ENV/PYTHONSTARTUP/PYTHONHOME`.
- strace `openat(... reward.(txt|json) ... O_WRONLY|O_RDWR|O_CREAT)` tripwire zeroes reward on any write to a reward file during the strace window; reward files written atomically via `os.replace()`.

**Oracle detection**
- Oracle-only secret token (`HARBOR_ORACLE_FLAG`, injected via `[solution.env]`) written by `solve.sh` to `/app/.harbor_oracle_marker`; test.sh stages the answer key and skips anti-cheat only on exact token match — agent never sees the token, cannot forge it.

**Scoring design**
- Canary gate requires 100% exact (line,code) match on 7 fundamental cases (incl. 2 clean files) BEFORE any hidden credit; final reward = `id_rate * non_id_rate` (clean-file pass-rate × error-file pass-rate), so the score is gated to 0 unless the checker is both precise and recall-correct — a no-op (all-clean) checker gets id_rate 1.0 but non_id_rate 0.0 → 0.0, and the starter (only TS2304) fails the canary gate → exactly 0.0 baseline.

### Gap Analysis

(No meaningful undefended vectors. Isolation passes fully; corpus lookup, compiler shell-out, answer-key read, reward-file write, and background-process persistence are all closed.)

**Acknowledged gaps**
- test.sh comments note `/logs/verifier` is intentionally relaxed to 0755/0644 (`relax_reward_perms`) only AFTER verification completes so the Harbor host (UID 1000) can read reward files — the agent container is already dead, so this is safe by design.

**Verdict: PASS**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Canary 100% hard gate precedes scoring; no-op scores 0.0 via id×non_id product. |
| Test quality | PASS | 1390 hidden cases (579 clean / 811 error) from real TS conformance corpus across ~27 categories; 7 canaries. |
| Determinism | PASS | Static answer keys from tsc; no runtime randomness in scoring; checker timing recorded but not scored. |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | PASS | No meaningful gaps found |
| Baseline reward | PASS | Starter detects only TS2304 ⇒ fails canary (TS2322/2339/2554) ⇒ 0.0. |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | Starter tscheck runs out of box; @babel/* globally installed; 1547 sample .ts+.errors; lib/ d.ts files present. |
| Instruction ↔ workspace | PASS | @babel/parser/traverse/types installed & mentioned; gcc/g++/make/python3 present; no mentioned-but-missing tools. |
| Reference docs | PASS | Sample tests with .errors files and TS lib .d.ts serve as worked examples; TS error codes are well-known to models. |

### Notes

- **Hidden error codes ⊃ listed codes (reviewed, PASS):** Hidden diagnostics use ~50+ TS codes; only ~52% fall under the 10 "Key Error Codes" listed. This is fair — instruction frames them as codes to "aim to support," and the 1547 visible `.ts`/`.errors` pairs expose all 422 codes (including every code in the hidden set). The hidden set is a structural superset (perturbed variants of the same conformance corpus, 0 filename overlap), giving the agent full signal. Good anti-overfit pattern, not a new-requirement leak.
- **babel `^7` range (WARN):** Image reproducibility depends on `^7` resolving consistently at build time; pin exact versions for full determinism.
- **job.yaml sandbox_timeout_secs=9000 (WARN):** Below the Modal guideline of agent+verifier+1800 (=16200). With both timeouts at 7200 a long agent run + long verifier run could exceed the sandbox. Consider raising or lowering the agent/verifier budgets.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

### Overview

| Metric | Value |
|--------|-------|
| Trials | 2 |
| Models tested | 1 |
| Overall success rate | 1/2 (50%) |
| Mean reward | 0.0606 |
| Reward range | 0.0000 – 0.1212 |
| Total cost | $53.38 |
| Oracle reward | 1.0000 (job: 2026-06-09__12-43-55) |

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 1/2 (50%) | 0.0606 | 105m | $26.69 |
| **Overall** | **2** | **1/2 (50%)** | **0.0606** | **105m** | **$26.69** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| M53Pt8j | 0.1212 | 90m | $31.22 | Passed canary; non_id_rate=0.12 (99/811 error files) | Incremental modular type engine; added codes one at a time with zero-FP discipline |
| 6TTeHuT | 0.0000 | 120m | $22.16 | Below threshold (canary 6/7, missed TS2339) | Breadth-first extension with custom eval harness; timed out before passing canary |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 2/2 FAIR |
| Infrastructure failures | None |
| Task fairness issues | None |
| False negatives | None |
| False positives | None |
| Reward hacking attempts | None |
| Verifier quality issues | None |
| Verifier timeout buffer | OK — oracle verifier ran 8.8s vs 7200s timeout (>>2x) |
<!-- END:ROLLOUT_RESULTS -->
