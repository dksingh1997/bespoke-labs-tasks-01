# CommonMark inline-level Markdown to HTML in C

> Implement a from-scratch C program that converts CommonMark Markdown (inline-level constructs: emphasis, code spans, links, images, autolinks, raw HTML, entities, escapes, line breaks) from stdin to HTML on stdout. The binary must build with the provided Makefile and is validated against a 268-case visible test suite plus held-out cases.

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

> 32 PASS, 8 WARN, 0 FAIL — **WARN** | 1419.1s | $6.50
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | instruction.md, task.toml, environment/Dockerfile, and tests/test.sh all present. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=600, build_timeout_sec=600, agent.user=agent. |
| Dockerfile Required Tools | PASS | git and tmux are installed in the Dockerfile. |
| Tests Folder Lean | WARN | tests/ contains extra assets (compute_reward.py, harness.py, hidden_cases/, perf_data/, visible_cases/) that should live in environment/tests/. |
| Directory Cleanliness | PASS | No stray files at root; qa-logs/ and results/ are ignored per rules, jobs/ and .env are gitignored. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml sets [agent] user = "agent" (line 13). |
| Dockerfile Isolation | PASS | All required isolation primitives are present in the Dockerfile. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first then wipes, sandboxes every agent-code execution under su agent + strace, and always exits 0. |
| Verifier Type | PASS | runs_agent_code: verifier compiles and executes the agent's md2html C binary, so strace + su agent are required and properly applied. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | Task is C-based with no Python/JS/Rust application dependencies requiring a lockfile. |
| Package Manager | N/A | No Python/pip usage; only apt-installed system packages and a cmark build from source. |
| Docker Image Cached | WARN | task.toml has no docker_image field set — expected during development, must be set before final delivery. |
| Cmark Pin | WARN | cmark is fetched via 'git clone --depth 1' with no commit SHA, so the reference implementation version can drift across rebuilds. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable (md2html binary at /app/workspace/md2html), stdin/stdout interface, build commands, and scope are all explicit. |
| Time Awareness | PASS | Explicit 'You have 2 hours. Build, test, and iterate.' at the end. |
| Tone | PASS | Direct and pragmatic with helpful 'tricky areas' hints, reads like a colleague handoff rather than a formal spec. |
| Length | WARN | 124 lines, slightly over the 100-line guideline; the CommonMark section list and test-runner bash snippet could be trimmed or linked. |
| Scoring Leakage | PASS | No mention of scorer, verifier, reward, or test.sh; 'held-out inputs' is acceptable framing for hidden test corpus. |
| Tools Documented | PASS | make, gcc, and python3 (for JSON-driven test loop) are all referenced with example commands. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | Starter md2html.c emits empty string so correctness=0 and perf is gated to 0, yielding composite 0.0. |
| Adversarial Audit | PASS | All identified vectors are closed by /tests 0700, agent-uid execution, strace tripwires, and root-only cmark; remaining gaps are well-mitigated. |
| Agent Code As User | PASS | Every build and every md2html invocation is wrapped in `su agent -s /bin/bash -c 'env -i ...'`. |
| Strace Tracing | PASS | strace -f traces build, correctness, and one perf run per file; logs are scanned for reward openat and external-converter execve before scoring. |
| Verifier Protected | PASS | compute_reward.py runs `python3 -ISs` from /tests, takes only CLI counters, never reads /app or imports agent code. |
| Fault Tolerance | PASS | fail_with always writes reward 0.0 via compute_reward.py and exits 0; build/strace/perf steps are bounded by `timeout`. |

**Acknowledged / Acceptable Gaps**
- Performance is measured on UNTRACED runs while only one perf run per file is traced; a converter could detect ptrace via /proc/self/status TracerPid and exec a fast external tool only when untraced. — cmark is locked behind chmod go-rwx (EACCES for agent); pandoc/node/perl/ruby are not installed; only python3 is available and a stdlib-only Markdown impl is slower than a real C parser, so the speedup vector has no fast target in this image.
- tests/ root contains visible_cases/, hidden_cases/, perf_data/, harness.py, compute_reward.py in addition to test.sh, violating the HARBOR_GUIDE 'only test.sh in tests/' convention. — /tests is chmod 700 root at container start and re-locked by test.sh, so the agent cannot read these even though they ship via docker cp instead of being baked into the image; purely a layout/style concern, not exploitable.
- /logs/agent is writable by the agent throughout the trial; agent traces could be tampered before verification. — Inherent to the single-container model and explicitly acknowledged by HARBOR_GUIDE; does not affect reward computation, which never reads /logs/agent.

**Existing Defenses**
- **Filesystem lockdown**: /tests chmod 700 root-only at runtime (re-locked in test.sh prologue); /logs/verifier chmod 700 then rm -rf as first action; cmark reference installed in /opt/verifier_tools with chmod go-rwx (agent EACCES); Output files pre-created 0666 in root-owned 0755 staging dir (agent can write but not unlink/symlink-swap)
- **User separation**: [agent] user = "agent" in task.toml; su agent -s /bin/bash -c 'env -i ...' wraps every build and md2html invocation; pkill -9 -u agent + verification of no surviving agent procs before verification
- **Runtime tracing**: strace -f traces clone/fork/execve/openat over build, correctness, and one perf run per file; reward_tamper_in greps for openat of reward.{txt,json} with O_WRONLY|O_RDWR|O_CREAT; converter_execve_in greps for execve of cmark/pandoc/python/node/perl/ruby/markdown
- **Scoring integrity**: compute_reward.py runs python3 -ISs from /tests with no /app reads, only CLI counters; harness.py grade uses O_NOFOLLOW + S_ISREG + st_nlink<=1 FD-pinned reads of agent outputs; reward.json/reward.txt written atomically via os.replace(); Performance score multiplied by correctness rate (smooth gate)
- **Environment hygiene**: Env stripped (LD_PRELOAD, PYTHONPATH, BASH_ENV, CFLAGS, CC, etc.) and PATH pinned; Static anti-cheat scan for #include of md libs, exec/system/popen of converters, wrapper scripts; ELF sanity check via `file` rejects script masquerading as md2html; Oracle marker token (per-task random hex) gates the cheat-skip path; token never exposed to agent or verifier env

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Baseline emits empty string and matches only 1/385 expected outputs (~0.0026 correctness, ~0.0013 gated perf, composite ~0.002 << 0.01). |
| Implementation Agnostic | PASS | Correctness is byte-equal vs CommonMark reference HTML and perf is wall-time vs cmark with 5x slack, so any valid C inline implementation scores equally. |
| Dimension Balance | WARN | Performance is gated by correctness (good), but correctness is NOT gated by performance under arithmetic-mean aggregation, so a correct-but-slow solution still scores 0.5 with zero perf. |
| Shortcut Resistant | PASS | Empty/constant/copy-input outputs fail byte-equal grading on ~all 385 cases, and static + execve tripwires block external Markdown libraries and shell-outs to cmark/pandoc/python. |
| Modular Scoring | PASS | compute_reward.py runs outside strace as root, takes only CLI counters, and never imports/reads /app, so it is independently re-runnable from the staged manifests and counters. |
| Reward Json Schema | PASS | Both fail_with and the success path write reward.json with score (float), subscores (list of {subtask,score}), and additional_data (dict); failure path includes subscores with zeros. |

**Reward Formula**: `composite = 0.5 * correctness_rate + 0.5 * (perf_raw_rate * correctness_rate); correctness_rate = passed / (visible_total + hidden_total); perf_raw_rate = mean over perf files of min(1.0, cmark_median * 5 / agent_median)`
Equal-weighted correctness and performance, with performance multiplicatively gated by correctness so a fast-but-wrong binary collapses to ~0 instead of harvesting the perf half.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| correctness | byte-equal match against CommonMark reference HTML across 268 visible + 117 hidden inline cases | none (raw pass rate) / 0.50 |
| performance | per-file min(1, cmark_median*5/agent_median) averaged over perf files (currently 1 file) | multiplied by correctness_rate / 0.50 |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Instruction asks for correctness vs CommonMark reference and speed comparable to production C parser; verifier scores exactly those two (50% correctness vs expected HTML + 50% median-of-3 perf vs cmark). |
| Definitions Documented | PASS | CommonMark 0.31.2 spec is linked, all in-scope inline sections are enumerated, and stdin/stdout interface + build path are explicit; internal 5x cmark perf threshold is hidden but agent only needs to optimize, not target a number. |
| Tools Accessible | PASS | Dockerfile installs gcc/make/build-essential; workspace ships Makefile + md2html.c starter matching the documented build command; cmark is correctly root-only and only unlocked on the oracle path. |
| Oracle Exists | PASS | solution/solve.sh exists (63 lines), writes the oracle marker and installs a cmark-execve wrapper that the verifier permits via token-gated bypass. |
| Hidden Test Fairness | PASS | 117 hidden cases cover the same CommonMark sections as the 268 visible cases (only additional section is 'Soft line breaks', which is explicitly listed as required in instruction.md) — structural variants, no new requirements. |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | WARN | Slim base and cache cleaned, but build-essential already provides gcc and make so listing them again is redundant. |
| Solution Clean | PASS | /solution contains only solve.sh with a clear token-gated cmark wrapper. |
| Testsh Quality | WARN | Core anti-cheat layout is sound, but several env-sanitisation and chmod steps duplicate protections already provided by `env -i` and the 0700 /tests directory. |
| Git Hygiene | PASS | No files exceed 30MB; largest assets are tests/perf_data (1.5MB) and the test-suite JSON corpora (~1MB each). |
| Workspace Clean | WARN | tests/visible_cases/ is a byte-identical duplicate of environment/test-suite/, and tests/{hidden_cases,perf_data}/ should live in environment/tests/ per the Harbor layout rule. |

**Cleanup Suggestions**
- `environment/Dockerfile`: explicit 'gcc' and 'make' apt packages — build-essential already pulls in gcc and make
- `tests/test.sh`: chmod -R go-rx /tests/visible_cases /tests/hidden_cases /tests/perf_data — parent /tests is already mode 0700, so non-root cannot descend regardless of child modes
- `tests/test.sh`: unset CFLAGS CC CXX MAKEFLAGS — every build/run step uses `env -i` which wipes the entire environment
- `tests/test.sh`: find /tests -type f -name '*.sh' -exec chmod +x — test.sh is the only .sh file and Harbor itself makes it executable to invoke it
- `tests/visible_cases/`: 268 JSON files duplicating environment/test-suite/ — identical content; harness.py can point --visible-dir at /app/test-suite instead
- `tests/`: harness.py, compute_reward.py, hidden_cases/, perf_data/ — Harbor convention is for tests/ to contain only test.sh; everything else should be bundled into the image via environment/tests/


### Notes

- **Format Check**: Move compute_reward.py, harness.py, hidden_cases/, perf_data/, and visible_cases/ from tests/ to environment/tests/ and COPY them into /tests in the Dockerfile so the tests/ task-root directory only contains test.sh.
- **Format Check**: Note: environment/ already contains test-suite/ which appears to duplicate visible_cases/ — verify the Dockerfile bundles the correct hidden assets at build time once tests/ is slimmed.
- **Reproducibility**: Pin cmark to a specific commit SHA in the Dockerfile to guarantee reproducible verifier behavior.
- **Reproducibility**: Set [environment].docker_image to a prebuilt registry image before final delivery.
- **Instruction Quality**: Consider trimming the bullet duplication between 'What You Must Implement' (lines 35-50) and 'Inline-level structures' (lines 52-60) to bring length under 100 lines.
- **Reward Design**: Consider multiplicative aggregation (composite = correctness * (a + b*perf_raw)) or power-mean(p<0) so a correct-but-very-slow solution does not still earn the full 0.5 correctness weight; current gate is one-directional.
- **Reward Design**: Only 1 perf file (perf_links.md) — add a few more covering emphasis-heavy, escape-heavy, and large-paragraph inputs to make the perf signal less brittle to a single workload shape.
- **Cleanliness**: Drop redundant apt packages (gcc, make) from the Dockerfile.
- **Cleanliness**: Move tests/{harness.py, compute_reward.py, hidden_cases, perf_data} into environment/tests/ and delete tests/visible_cases (read from /app/test-suite instead) so tests/ contains only test.sh per the Harbor layout rule.
- **Cleanliness**: Trim three redundant prologue steps from test.sh (recursive chmod, compiler env unsets, *.sh chmod find) — none add defence beyond the 0700 /tests dir and `env -i`.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/md2html-inlines` to populate.*
<!-- END:ROLLOUT_RESULTS -->
