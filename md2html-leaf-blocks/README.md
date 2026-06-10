# CommonMark leaf blocks converter in C

> Implement a Markdown-to-HTML converter in C from scratch covering CommonMark leaf blocks (headings, code blocks, HTML blocks, thematic breaks, paragraphs). Reads stdin, writes HTML to stdout, must match the CommonMark reference output.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | programming |
| Agent Timeout | 7200s |
| Verifier Timeout | 600s |
| Internet Access | Disabled |
| CPUs / Memory | 2 / 4096 MB |

---

## Pre-Rollout QA

> 34 PASS, 5 WARN, 0 FAIL — **WARN** | 176.3s | $6.13
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | instruction.md, task.toml, environment/Dockerfile, and tests/test.sh all present. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml are all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=600, build_timeout_sec=600, agent.user=agent. |
| Dockerfile Required Tools | PASS | Dockerfile installs both git and tmux via apt-get. |
| Tests Folder Lean | WARN | tests/ contains extra assets (compute_reward.py, harness.py, hidden_cases/, perf_data/, visible_cases/) that should live in environment/tests/. |
| Directory Cleanliness | PASS | No stray files at task root after ignoring gitignored and standard-ignored entries. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml sets [agent] user = "agent". |
| Dockerfile Isolation | PASS | All required isolation primitives are present in the Dockerfile. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first, wipes, sanitises env, runs agent code as agent under strace+timeout, scores outside strace, always exits 0. |
| Verifier Type | PASS | runs_agent_code: verifier compiles and executes the agent's C md2html binary, so su-agent + strace wrapping is required and present. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | Pure C task with no Python/Node package-manager dependencies, so no lockfile is applicable. |
| Package Manager | N/A | No Python or Node package manager is used; Dockerfile only invokes apt-get and builds cmark from source. |
| Docker Image Cached | WARN | task.toml does not set `docker_image`, which is expected during development but must be set before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable (/app/workspace/md2html), interface (stdin/stdout), scope, and build commands are explicit and unambiguous. |
| Time Awareness | PASS | Final section states 'You have 2 hours. Build, test, and iterate.' |
| Tone | WARN | Reads more like a formal spec with many headings than a conversational colleague handoff. |
| Length | PASS | 116 lines — slightly over 100 but acceptable for a parser task that needs scope enumeration. |
| Scoring Leakage | PASS | No mention of scorer, verifier, reward, or evaluation; 'tests' refers only to the visible dev test corpus. |
| Tools Documented | PASS | make, gcc, python3, and timeout are shown in example commands; starter Makefile and md2html.c are provided in the workspace. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | Stub md2html emits empty string so all cases fail; performance is gated by correctness so composite collapses to 0. |
| Adversarial Audit | PASS | Reward file is locked+wiped before any agent code runs, /tests is re-locked to 0700, builds/runs occur as agent under strace, scoring runs as root outside strace from CLI counters only. |
| Agent Code As User | PASS | Every md2html build (make/gcc) and run (correctness + perf) is invoked via `su agent -s /bin/bash -c 'env -i ...'`. |
| Strace Tracing | PASS | strace -f wraps build, correctness, and each perf run; reward_tamper_in() and converter_execve_in() are checked before scoring. |
| Verifier Protected | PASS | compute_reward.py runs as `python3 -ISs`, takes only CLI counters, and never imports or reads from /app or any agent-writable path. |
| Fault Tolerance | PASS | fail_with() always writes reward 0.0 and exits 0; build/correctness/perf invocations are bounded by `timeout`, and test.sh ends with `exit 0`. |

**Acknowledged / Acceptable Gaps**
- Performance ratio can be inflated by fast-exiting on perf inputs (perf only measures wall time, not output) — Performance is multiplicatively gated by correctness (perf_rate = raw * correctness_rate), so a fast-but-empty converter still scores ~0 overall; documented in compute_reward.py.
- Agent could statically link or vendor a renamed Markdown library to bypass the #include-based static scan — This requires actually producing CommonMark-correct output, which is the legitimate task; the static scan targets the obvious exec/system/popen/wrapper-script cheats, not all possible reuse, and any external-converter execve is independently caught by strace at run time.
- Agent code under /app is not protected from runtime self-modification between snapshot and grading — Snapshot is for audit only; grading reads pre-created root-owned output files (not /app), and the converter is rebuilt-from-source as the agent user under strace, so workspace tampering cannot change what the verifier scores.

**Existing Defenses**
- **Filesystem lockdown**: /logs/verifier chmod 700 + rm -rf before any agent execution; /tests re-locked to 0700 with go-rx stripped from visible/hidden/perf subdirs; cmark reference kept in /opt/verifier_tools mode go-rwx (root-only); output staging dir root-owned 0755, per-case files 0666 only; FD-pinned O_NOFOLLOW reads with S_ISREG + nlink<=1 checks in harness.grade
- **User separation**: Agent user (uid 1000) owns /app only; All compiles and md2html invocations run via `su agent -s /bin/bash -c 'env -i PATH=... ...'`; Scoring runs as root, OUTSIDE strace, with python3 -ISs
- **Runtime tracing**: strace -f -e clone,clone3,fork,vfork,execve,openat over build, correctness, and per-perf-file runs; reward_tamper_in greps for openat of reward.{txt,json} with O_WRONLY|O_RDWR|O_CREAT; converter_execve_in greps for execve of cmark/pandoc/markdown/python/node/perl/ruby in md2html run logs
- **Process isolation**: pkill -9 -u agent before workspace snapshot, with retry+abort if survivors; Each su agent block runs under timeout (300/480/60s) so descendants cannot stall the verifier
- **Scoring integrity**: compute_reward.py only reads CLI integers and an optional root-written failed-cases file under /logs/verifier (0700); reward.json/reward.txt written atomically via os.replace; Performance is multiplicatively gated by correctness so fast-empty binaries score ~0

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Byte-exact HTML match per case; starter/empty/regressing outputs yield 0 correctness, and performance is multiplied by correctness so a fast-but-wrong binary collapses to 0. |
| Implementation Agnostic | PASS | Scoring compares output to CommonMark spec HTML byte-for-byte, so any correct from-scratch C parser scores fully regardless of internal algorithm. |
| Dimension Balance | PASS | Two dims (correctness, performance) are aggregated as weighted_sum but performance is multiplicatively gated by correctness_rate, so neither dim is trivially maxable without the other. |
| Shortcut Resistant | PASS | Empty output, identity echo, or random text all fail byte-exact comparison against expected HTML, yielding ~0 correctness and therefore ~0 composite. |
| Modular Scoring | PASS | compute_reward.py only consumes CLI counters and an optional failed-cases list; harness.py does grading independently and neither imports agent code, so scoring is re-runnable from staged outputs. |
| Reward Json Schema | PASS | Both success and failure paths emit score (float), subscores (list of {subtask, score}), and additional_data; reward.txt mirrors the float. |

**Reward Formula**: `composite = 0.5 * correctness_rate + 0.5 * (perf_rate_raw * correctness_rate), where correctness_rate = passed/(visible+hidden) and perf_rate_raw = mean over perf files of min(1, (cmark_median*5)/agent_median)`
Equal weighting of correctness and speed, with performance multiplicatively gated by correctness so a fast-but-incorrect binary cannot harvest the perf half.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| correctness | fraction of 171 visible+hidden cases whose md2html output byte-matches the CommonMark reference HTML | none (drives the perf gate) / 0.5 |
| performance | mean over 2 perf inputs of min(1, 5*cmark_median_time / agent_median_time), median-of-3 | multiplied by correctness_rate / 0.5 |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Verifier scores correctness (visible+hidden CommonMark cases) and performance vs cmark, both aligned with instruction's stated goals of correct + fast. |
| Definitions Documented | PASS | Instruction links CommonMark 0.31.2 spec and enumerates the 9 leaf-block sections; internal scoring thresholds (5x cmark, correctness gate) need not be disclosed. |
| Tools Accessible | PASS | gcc/make installed via Dockerfile, starter Makefile and md2html.c present in /app/workspace; solve.sh uses the stock Makefile path which the verifier builds. |
| Oracle Exists | PASS | solution/solve.sh exists (63 lines) and installs a token-gated cmark-wrapper md2html.c. |
| Hidden Test Fairness | PASS | All 54 hidden cases cover the same 9 CommonMark sections enumerated in instruction.md (Tabs, Thematic breaks, ATX/Setext headings, Indented/Fenced code, HTML blocks, Paragraphs, Blank lines). |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | PASS | Slim base, apt lists cleaned, cmake purged after building cmark; every remaining package (build-essential/gcc/make for agent C build, git/tmux/strace as Harbor hard-rule tools, procps for pkill in test.sh, file for the ELF check, ca-certificates for the cmark git clone) is load-bearing. |
| Solution Clean | PASS | Only solve.sh present in /solution. |
| Testsh Quality | WARN | Most sections are load-bearing but a few overlap with isolation already in place. |
| Git Hygiene | PASS | No individual file exceeds 30MB; largest assets are small JSON test cases and ~4.5MB perf corpus. |
| Workspace Clean | WARN | Heavy test assets live under `tests/` at task root instead of `environment/tests/`, so ~5MB (harness.py + compute_reward.py + hidden_cases/ + perf_data/ + visible_cases/) is uploaded per trial via docker compose cp rather than baked into the image. |

**Cleanup Suggestions**
- `test.sh`: chmod -R go-rx on /tests/visible_cases, /tests/hidden_cases, /tests/perf_data (lines 62) — /tests is already chmod 700 root, so the agent cannot traverse into these subdirs regardless of their inner mode bits
- `tests/ layout`: harness.py, compute_reward.py, hidden_cases/, perf_data/, visible_cases/ live at task root tests/ — Harbor uploads tests/ per trial via docker compose cp; bundling these into the image (move to environment/tests/ and COPY to /tests with chmod 700) eliminates ~5MB of per-trial upload and keeps the convention that tests/ at root only holds test.sh
- `environment/`: no .dockerignore — Minor — there are no large/unwanted files in the build context today, but a .dockerignore documents intent and protects against future drift


### Notes

- **Format Check**: Move tests/compute_reward.py, tests/harness.py, tests/hidden_cases/, tests/perf_data/, and tests/visible_cases/ to environment/tests/ and COPY them into /tests via the Dockerfile so tests/ contains only test.sh.
- **Reproducibility**: Before final delivery, build and push the image to a registry and set [environment].docker_image in task.toml.
- **Reproducibility**: Consider pinning the cmark git clone to a specific commit SHA instead of --depth 1 on the default branch for stronger reproducibility.
- **Instruction Quality**: Consider trimming section headers and converting to a more conversational handoff tone to better match colleague-handoff style.
- **Cleanliness**: Move harness.py, compute_reward.py, hidden_cases/, perf_data/, visible_cases/ from tests/ into environment/tests/ and COPY them into /tests (chmod 700) in the Dockerfile; leave only test.sh in tests/.
- **Cleanliness**: Drop the redundant chmod -R go-rx on /tests subdirs in test.sh (dominated by /tests 0700).

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/md2html-leaf-blocks` to populate.*
<!-- END:ROLLOUT_RESULTS -->
