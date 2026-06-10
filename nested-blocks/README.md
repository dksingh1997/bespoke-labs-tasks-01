# CommonMark container blocks converter in C

> Implement a from-scratch C program that converts CommonMark Markdown (lists and block quotes) to HTML via stdin/stdout. The binary builds with make at /app/workspace/md2html and must match reference HTML on 73 visible plus held-out cases while staying fast.

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

> 32 PASS, 7 WARN, 0 FAIL — **WARN** | 222.2s | $6.36
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | instruction.md, task.toml, environment/Dockerfile, and tests/test.sh all exist. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml are all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=600, build_timeout_sec=600, agent.user=agent. |
| Dockerfile Required Tools | PASS | git and tmux are installed via apt-get in the Dockerfile. |
| Tests Folder Lean | WARN | tests/ contains extra assets (compute_reward.py, harness.py, hidden_cases/, perf_data/, visible_cases/) that should live in environment/tests/ and be bundled at build time. |
| Directory Cleanliness | PASS | No stray files at task root after ignoring gitignored and standard-ignored entries. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml sets [agent] user = "agent" for non-root agent execution. |
| Dockerfile Isolation | PASS | Dockerfile creates non-root agent, locks /tests, hands /app and /solution to agent, and installs strace. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first then wipes, re-locks /tests, runs all agent-code phases as `su agent` inside strace -f with timeout, and computes reward outside strace. |
| Verifier Type | PASS | runs_agent_code — verifier compiles the agent's C sources and executes the resulting md2html binary, so strace + su agent are mandatory and present. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | No Python/Node/Rust dependency manifests; only apt packages and an unpinned cmark git clone. |
| Package Manager | N/A | Task is pure C with only stdlib Python in tests; no pip/uv usage. |
| Docker Image Cached | WARN | task.toml has no docker_image field (acceptable during development; required before final delivery). |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable, interface, compilation command, and CommonMark scope are unambiguous. |
| Time Awareness | PASS | Explicit '2 hours' time limit at the end. |
| Tone | WARN | Mostly clear but reads more like a spec than a colleague handoff, with formal section headers and rule lists. |
| Length | WARN | 107 lines, slightly over the 100-line target. |
| Scoring Leakage | PASS | No mention of scorer, verifier, reward, or evaluation; 'tests' refers only to the visible CommonMark corpus. |
| Tools Documented | PASS | make, gcc, python3, and the starter Makefile/md2html.c are all mentioned. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | Starter md2html outputs empty string, fails all cases; correctness=0 gates performance to 0, composite=0.0. |
| Adversarial Audit | PASS | Reward dir locked 700 first thing, /tests re-locked 700, all agent code runs as agent user under strace with timeouts, output files pre-created in root-owned 0755 dirs preventing unlink/symlink swaps. |
| Agent Code As User | PASS | Build, correctness runner, and performance runs all execute via `su agent -s /bin/bash -c ...` with env -i; no agent code runs as root. |
| Strace Tracing | PASS | Build, correctness, and one perf run per file are wrapped in `strace -f` and logs are checked for reward-file openat writes and external-converter execve before scoring. |
| Verifier Protected | PASS | compute_reward.py runs as `python3 -ISs` outside strace, reads only CLI counters and a root-written failed-cases file in /logs/verifier; never imports from /app. |
| Fault Tolerance | PASS | fail_with() always writes reward 0.0 and exits 0; strace/timed subprocesses are wrapped in `timeout`; no `set -e` so errors don't abort early. |

**Acknowledged / Acceptable Gaps**
- Timed perf runs are untraced (strace overhead would skew timing); a converter could in principle behave differently when not traced. — Reward file is chmod 700 root-owned during these runs, /tests is locked, and the agent uid has no system-write surface; the one traced perf run per file would catch external-converter execve and an attacker has no way to alter scoring from an untraced agent-uid run.
- /app/workspace is agent-writable; agent could plant conftest-style or .pth files. — Verifier never imports from /app; harness.py and compute_reward.py run with `python3 -ISs` and read only /tests + root-written counters.
- /logs/agent is 777 throughout — agent can tamper with its own traces. — Documented Harbor limitation; agent self-trace tampering does not affect reward computation.

**Existing Defenses**
- **Filesystem lockdown**: /logs/verifier chmod 700 + wiped before anything else; /tests re-locked to 700 after Harbor's upload-phase reset; Output staging dirs root-owned 0755 with pre-created 0666 files (no unlink/symlink swap); FD-pinned O_NOFOLLOW reads of agent output, reject non-regular/hardlinked files
- **User separation**: Agent runs as `agent` (uid 1000); verifier runs as root; Every build/run of agent code uses `su agent -s /bin/bash -c` with `env -i` to strip inherited state; cmark reference installed in /opt/verifier_tools with chmod -R go-rwx
- **Process auditing**: strace -f wraps build, correctness, and per-perf-file runs; Reward-file openat-write tripwire on every strace log; External-converter execve tripwire on correctness + perf strace logs (skipped only on verified oracle marker); pkill -u agent before verification to clear leftover background processes
- **Anti-cheat**: Static source scan for Markdown library #includes, exec-family of external converters, and wrapper scripts; ELF file-type check rejects shell/python wrappers; Random 16-hex oracle marker token gates anti-cheat bypass; token never exposed to agent (lives in root-only /tests/test.sh and [solution.env])
- **Verifier hygiene**: compute_reward.py and harness.py invoked with `python3 -ISs` (no site, no env); Reward written atomically via os.replace(); Environment sanitised (LD_PRELOAD/LD_LIBRARY_PATH/PYTHONPATH/CFLAGS/CC/CXX unset; PATH pinned); Performance gated by correctness (perf_rate *= correctness_rate) so fast-empty binaries get 0

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Perf is multiplied by correctness_rate, so any incorrect/regressing solution collapses both subscores toward 0. |
| Implementation Agnostic | PASS | Correctness compares HTML output to CommonMark reference and perf is wall-clock vs cmark, both measure the deliverable not a specific algorithm. |
| Dimension Balance | PASS | Two dimensions (correctness, performance) with performance gated multiplicatively on correctness so neither can be maxed in isolation while ignoring the other. |
| Shortcut Resistant | PASS | Empty/constant/copy-input outputs fail nearly all 99 cases, dropping correctness to ~0 and dragging the gated perf term to ~0 as well. |
| Modular Scoring | PASS | compute_reward.py runs outside strace as root, reads only CLI counters and a root-written failed-cases file, never imports or executes agent code. |
| Reward Json Schema | PASS | Both success and --fail paths write reward.json with score, subscores list, and additional_data, and reward.txt with a single float. |

**Reward Formula**: `composite = 0.5 * correctness_rate + 0.5 * (perf_raw * correctness_rate); per-file perf = min(1.0, (cmark_median * 5.0) / agent_median); correctness_rate = (visible_pass + hidden_pass) / total`
Weighted sum of correctness and performance with performance multiplicatively gated by correctness so fast-but-wrong converters cannot harvest half the score.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| correctness | fraction of visible+hidden CommonMark cases whose HTML output exactly matches the reference | none (drives the perf gate) / 0.50 |
| performance | mean of per-file min(1, 5 * cmark_median / agent_median) across perf corpus | multiplied by correctness_rate / 0.50 |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | WARN | Instruction mentions correctness and speed but does not disclose that performance is 50% of the score or that the speed gate compares against cmark with a 5x factor. |
| Definitions Documented | PASS | CommonMark spec is linked and tricky terms (loose/tight, lazy continuation, list-item indentation) are defined in instruction.md. |
| Tools Accessible | PASS | Dockerfile installs gcc/make/build-essential and workspace ships Makefile + md2html.c stub matching the documented build commands. |
| Oracle Exists | PASS | solution/solve.sh exists (2359 bytes) and installs a token-gated cmark wrapper as the reference oracle. |
| Hidden Test Fairness | PASS | Hidden cases cover the same three CommonMark sections (Lists, List items, Block quotes) declared in instruction.md, as structural variants. |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | PASS | Slim Python base, apt cache cleaned, cmake purged after cmark build; every remaining package has a load-bearing use in test.sh or as a Harbor hard rule. |
| Solution Clean | PASS | solution/ contains only solve.sh, which writes the oracle marker and installs a cmark-wrapper reference. |
| Testsh Quality | WARN | Core orchestration is sound, but several blocks are redundant given the single-container, fresh-per-trial isolation model. |
| Git Hygiene | PASS | .gitignore covers .env and jobs/; no individual file exceeds 30MB (largest is perf_nested_lists.md at 1.7MB). |
| Workspace Clean | WARN | tests/ at the task root holds 2.1MB of assets (visible_cases, hidden_cases, perf_data, harness.py, compute_reward.py) that per Harbor spec belong in environment/tests/ and should be baked into the image — tests/ should contain only test.sh. |

**Cleanup Suggestions**
- `tests/visible_cases/`: 73 JSON case files duplicated byte-for-byte under environment/test-suite/ — visible_cases/ exists only because test.sh reads it from /tests/visible_cases at runtime; if these assets lived in environment/tests/ they would be COPYed into the image once and never re-uploaded per trial, eliminating the duplication
- `tests/hidden_cases/`: 26 hidden case JSONs sitting in the task root — per Harbor spec, tests/ at the task root should contain only test.sh; hidden_cases belongs in environment/tests/ so it ships inside the Docker image (faster uploads, leaner repo, cleaner upload-merge surface)
- `tests/perf_data/perf_nested_lists.md`: 1.7MB benchmark fixture re-uploaded every trial — static benchmark data should be baked into the image via COPY environment/tests/ /tests/ rather than re-shipped through docker compose cp on every verifier upload
- `tests/harness.py and tests/compute_reward.py`: Python verifier modules sitting in the task root — code that the verifier executes should be COPYed into the image at build time (environment/tests/ -> /tests/); only test.sh needs to live at the task root for Harbor's upload step
- `test.sh`: pkill/pgrep cross-phase isolation block (lines 146-153) including the fail_with branch — each trial runs in a fresh container with PID 1 = sleep infinity; no agent process can pre-exist before test.sh runs, and the /logs/verifier chmod 700 already cuts off any agent background process from writing the reward file
- `test.sh`: workspace_snapshot block (lines 158-164) — the snapshot is copied to /logs/verifier/workspace_snapshot but never consumed by any later step; if forensic preservation is the goal, Harbor's artifact collection already grabs /app/workspace per job.yaml
- `test.sh`: find /tests -type f -name '*.sh' -exec chmod +x at line 72 — no .sh file exists under /tests besides test.sh itself, which is already executing; the comment even concedes this is a Modal/Daytona safety net but the task is configured for local Docker
- `environment/`: missing .dockerignore — no exclusions means anything added to environment/ later (build artifacts, editor files) will land in the build context — a one-line .dockerignore is cheap insurance


### Notes

- **Format Check**: Move compute_reward.py, harness.py, hidden_cases/, perf_data/, and visible_cases/ from tests/ into environment/tests/ and COPY them into /tests at build time so tests/ contains only test.sh.
- **Reproducibility**: cmark is cloned with --depth 1 from main without a pinned tag/commit; pin a specific release before final delivery for reproducibility.
- **Reproducibility**: Set docker_image in task.toml before final delivery.
- **Instruction Quality**: Trim to <=100 lines by shortening 'Tricky areas' or relocating the visible-test loop into a workspace README.
- **Instruction Quality**: Soften tone: replace 'What You Must Implement' / 'Implementation Rules' headings with a brief colleague-handoff paragraph.
- **Reward Design**: Consider adding 1-2 more perf inputs (e.g. flat long list, deep block-quote nesting) so a single pathological file does not dominate the perf subscore.
- **Fairness**: Consider disclosing in instruction.md that scoring weighs correctness and performance equally, and that performance is measured relative to a reference C CommonMark implementation — this helps the agent prioritize iteration time appropriately.
- **Cleanliness**: Move tests/{visible_cases,hidden_cases,perf_data,harness.py,compute_reward.py} into environment/tests/ and add COPY environment/tests/ /tests/ in the Dockerfile (followed by chmod -R 700 /tests). Leave only test.sh at the task root.
- **Cleanliness**: Drop the pkill, workspace_snapshot, and stray chmod +x blocks from test.sh; they add log noise without closing any vector that user separation + the /logs/verifier lockdown does not already close.
- **Cleanliness**: Add a minimal environment/.dockerignore (at least: jobs/, results/, qa-logs/, .git, *.bak).

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/md2html-containers` to populate.*
<!-- END:ROLLOUT_RESULTS -->
