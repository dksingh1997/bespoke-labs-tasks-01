# CommonMark Markdown-to-HTML Converter (in C)

> The agent must implement a full CommonMark 0.31.2 Markdown-to-HTML converter from scratch in C — reading Markdown from stdin, writing HTML to stdout, using no existing Markdown library. The core challenge is correctly handling the entire CommonMark spec (tabs, lazy continuation, emphasis precedence, nested lists, link refs, entities) while keeping the parser fast on multi-MB documents.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | very_hard |
| Category | programming |
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
| task.toml | PASS | allow_internet=false; agent 7200s (justified for very_hard full-spec parser); verifier 600s; build 600s; user="agent" |
| Dockerfile | PASS | git/tmux/strace/file/procps installed; apt cleaned; cmark pinned via git but `--depth 1` (no commit SHA) — WARN below |
| reward.json schema | PASS | Writes score, reward, subscores list, additional_data; reward.txt written; no stray top-level keys |
| Oracle solution | PASS | solve.sh present; token-gated cmark `--unsafe` wrapper; paths correct |
| oracle.yaml / job.yaml | PASS | Both present at task level |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Unambiguous: stdin→stdout, make build, ELF binary; matches verifier interface |
| Scoring leakage | PASS | Mentions correctness+performance matter (domain-appropriate); no reward formula, weights, or verifier internals |
| Tone & length | PASS | 132 lines; natural handoff tone; points to /app/test-suite for reference cases |

### Reward Design

**Formula**: `composite = w_c·correctness_rate + w_p·(perf_raw × correctness_rate)`, with `w_c=w_p=0.5` after empty-category renormalization.

| Component | Metric | Gate / Scaling |
|-----------|--------|----------------|
| Correctness | fraction of (458 visible + 197 hidden) cases byte-exact vs cmark | none (raw rate, weight 0.5) |
| Performance | median-of-3 speed ratio `(cmark×5)/agent`, capped at 1.0, averaged over 5 perf files | multiplied by correctness_rate (weight 0.5) |

**Design rationale**: Performance is gated by multiplying the raw speed ratio by correctness_rate, so a fast-but-empty binary (the starter emits "" instantly) collapses toward 0 instead of harvesting half the score. The `×5` slack means matching cmark within 5× earns full performance credit — generous, since a from-scratch parser rarely beats a production C library. The gate is smooth/monotonic rather than a hard cliff, giving graded signal as correctness improves.

<!-- BEGIN:ANTI_CHEAT -->
### Isolation Checklist

| Check | Status | Detail |
|-------|--------|--------|
| agent.user in task.toml | PASS | `[agent] user = "agent"` set (line 13). |
| Dockerfile user setup | PASS | `useradd agent`; `chown -R agent:agent /app`; `mkdir -p /tests && chmod 700 /tests`; `mkdir -p /solution && chown agent:agent /solution`. cmark reference installed root-only in `/opt/verifier_tools` (chmod go-rwx). |
| Dockerfile strace | PASS | `strace` installed; needed — verifier compiles & runs agent C code (md2html). |
| test.sh /logs lockdown | PASS | `chmod 700 "$VERIFIER_DIR"` first, then `rm -rf "${VERIFIER_DIR:?}"/*` (lock-before-wipe). |
| test.sh strace wrapping | PASS | All builds + every md2html run wrapped in `strace -f` with `timeout`; scoring (`compute_reward.py`) runs as a separate step outside strace, after strace logs are analyzed. |
| Scoring imports /app | PASS | `compute_reward.py` reads only CLI counters + root-owned failed-cases file; never touches `/app`. Grading (`harness.py grade`) reads agent output FD-pinned but runs as root outside strace and is kept separate from compute_reward.py. |

### Anti-Cheat Measures

**Reference-implementation protection**
- cmark built into root-only `/opt/verifier_tools` (chmod go-rwx, outside `/app`) so the agent cannot read/swap the reference scorer or use it as its own engine; unlocked only on the token-verified oracle path.
- `/tests` re-locked to 0700 and `hidden_cases`/`perf_data` to `go-rx` at verify start, undoing Harbor's upload reset, so the agent (uid 1000) gets EACCES on answer keys and perf corpus.

**Builds/runs agent code under reduced privilege**
- Every `make`/`gcc` build and every `md2html` invocation runs as `su agent` with `env -i` (clean PATH/HOME/TMPDIR), so a `#include "/tests/..."` or runtime open of answer keys hits the 0700 wall; root-side grading and scoring run separately.
- Environment sanitised before agent phases: unsets `LD_PRELOAD/LD_LIBRARY_PATH/PYTHONPATH/PYTHONHOME/BASH_ENV/ENV/CFLAGS/CC/CXX/MAKEFLAGS` and pins PATH — blocks preload/interpreter/compiler side-channels.

**strace tripwires**
- `reward_tamper_in`: any write-mode `openat()` of `reward.{txt,json}` inside any strace window (build, correctness, perf) → score 0; nothing legitimate writes reward there.
- `converter_execve_in`: md2html exec'ing `cmark/pandoc/markdown/python/node/perl/ruby` → `external_converter_execve` fail; build-phase logs deliberately excluded (Makefiles may run python for codegen).

**Static source + binary checks**
- grep scan rejects `#include` of known MD libs, `system/popen/exec*` of external converters, `-lcmark`-style linking, and wrapper scripts (`md2html.{py,js,sh,rb,pl}`); `file` check rejects a non-ELF md2html masquerading as the converter.

**Output-integrity / process isolation**
- Output files pre-created root-owned 0666 in a root-owned 0755 dir; grading uses FD-pinned `O_RDONLY|O_NOFOLLOW`, rejecting symlinks, non-regular files, and `nlink>1` hardlinks — blocks symlink/hardlink swaps to the answer keys.
- Pre-verification `pkill -9 -u agent` (with re-check → `agent_processes_survived`) clears leftover agent processes before grading.

**Scoring design**
- 50% correctness (visible+hidden cases passed) + 50% performance (median-of-3 vs cmark, ratio `min(1, cmark*5/agent)`); performance is multiplied by the correctness fraction, so a fast-but-wrong binary (e.g. starter emitting empty output) collapses toward 0 instead of harvesting half the reward. Atomic `os.replace()` write of reward.json/txt; always `exit 0`.

### Undefended attack surfaces

(none material — isolation is sound; correctness depends on exact byte-match against root-only hidden keys the agent cannot read, and the perf gate neutralizes fast-wrong binaries.)

### Acknowledged gaps

- `/logs/agent/` trace tampering is inherent to the single-container model (per HARBOR_GUIDE) and not relevant here — verifier reads no agent traces.

**Verdict: PASS**
<!-- END:ANTI_CHEAT -->

### Verifier & Scoring Integrity

| Check | Status | Detail |
|-------|--------|--------|
| Correctness gating | PASS | Performance multiplied by correctness_rate; empty/wrong binary scores ~0 |
| Test quality | PASS | 655 cases (458 visible + 197 hidden) from CommonMark spec corpus — real, comprehensive |
| Determinism | WARN | Perf scoring is wall-clock timed; median-of-3 + 5× slack mitigate, but shared-host jitter possible |
| Isolation hardening | PASS | See Isolation Checklist in Anti-Cheat section |
| Reward hacking surface | PASS | No meaningful gaps found |
| Baseline reward | PASS | Starter md2html emits empty output → 0 correctness → composite 0.0 |

### Workspace

| Check | Status | Detail |
|-------|--------|--------|
| Build readiness | PASS | Starter md2html.c + Makefile compile out of box; `make`/gcc fallback both supported |
| Instruction ↔ workspace | PASS | Only gcc/make/python3 needed; all in image; no mentioned-but-missing tools |
| Reference docs | PASS | CommonMark is well-known; 458 visible example JSONs serve as concrete spec reference |

### Notes

- **cmark pinned with `--depth 1` (no commit SHA)**: WARN. The Dockerfile clones `commonmark/cmark` HEAD rather than a tagged release/SHA, so the reference scorer (and thus perf baseline + correctness expectations) is not fully reproducible across rebuilds. The test corpus itself is vendored as static JSON, so correctness grading is unaffected; only the perf baseline drifts. Pin to a release tag (e.g. `0.31.2`) for full reproducibility.
- **Wall-clock perf timing**: WARN. Median-of-3 with a 5× slack ratio absorbs most host jitter, but on a contended host the perf subscore could vary run-to-run. Acceptable given the generous threshold.
- **Hidden test fairness**: PASS — hidden cases (197) cover the same CommonMark spec sections as the visible set (458), differing only in literal example values. A correct general parser passes both; this is the good structural-variant anti-cheat pattern.

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
| Total cost | $5.67 |
| Oracle reward | 1.0000 (job: 2026-06-09__12-43-10) |

> **Note:** Both trials hit the 2-hour agent timeout with an incomplete, non-compiling `md2html.c`. The verifier ran in each case and scored 0.0 (`compilation_failed`). The timeout is a legitimate task outcome — the from-scratch CommonMark parser is too large to finish in the budget.

### Performance by Model

| Model | Trials | Success Rate | Mean Reward | Mean Time | Mean Cost |
|-------|--------|--------------|-------------|-----------|-----------|
| claude-opus-4-8 | 2 | 0/2 (0%) | 0.0000 | 120m | $2.84 |
| **Overall** | **2** | **0/2 (0%)** | **0.0000** | **120m** | **$2.84** |

### Trial Details

#### claude-opus-4-8

| Trial | Reward | Time | Cost | Outcome | Strategy |
|-------|--------|------|------|---------|----------|
| G7mibm2 | 0.0000 | 120m | $2.52 | Compilation failed (timed out) | Incremental bottom-up parser; appended scanners chunk-by-chunk, no main() by 2h |
| iM3eGmi | 0.0000 | 120m | $3.15 | Compilation failed (timed out) | Big-bang from-scratch parser; incomplete md2html.c, no main(), failed to link |

### Post-Rollout QA

> Each trial independently audited for fairness, reward hacking, and infrastructure issues.

| Check | Result |
|-------|--------|
| Trial verdicts | 2/2 FAIR |
| Infrastructure failures | None |
| Task fairness issues | None — both timeouts are legitimate; task is hard, not broken |
| False negatives | None |
| False positives | None |
| Reward hacking attempts | None |
| Verifier quality issues | None — verifier ran and correctly scored both at 0.0 (compilation_failed) |
| Verifier timeout buffer | OK — verifier ran in ~8–9s vs 600s limit (>60x headroom) |
<!-- END:ROLLOUT_RESULTS -->
