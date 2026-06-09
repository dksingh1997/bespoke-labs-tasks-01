# Fix x86-64 ELF static linker

> Agent is given a partially working single-file static linker (myld.c) for x86-64 Linux that compiles and emits structurally valid ELF but produces non-functional executables. They must debug and fix symbol resolution, section merging, relocations, and archive handling so linked test programs (including musl-libc programs) run correctly.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | systems-programming |
| Agent Timeout | 7200s |
| Verifier Timeout | 600s |
| Internet Access | Disabled |
| CPUs / Memory | 2 / 4096 MB |

---

## Pre-Rollout QA

> 34 PASS, 5 WARN, 0 FAIL — **WARN** | 200.3s | $5.74
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | instruction.md, task.toml, environment/Dockerfile, and tests/test.sh all present. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=600, build_timeout_sec=600, agent.user=agent. |
| Dockerfile Required Tools | PASS | git and tmux installed via apt-get. |
| Tests Folder Lean | WARN | tests/ contains compute_reward.py in addition to test.sh; should live in environment/tests/. |
| Directory Cleanliness | WARN | Stray job-local.yaml at task root is not a standard Harbor file. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml declares [agent] user = "agent" for non-root agent execution. |
| Dockerfile Isolation | PASS | All required isolation directives are present in the Dockerfile. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first then wipes, runs agent code as su agent under strace with timeout, and computes reward outside strace. |
| Verifier Type | PASS | runs_agent_code — verifier builds agent's myld and executes agent-produced ELFs. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | Task is C/systems-programming with no Python or external package dependencies requiring a lockfile. |
| Package Manager | N/A | No Python package manager used; toolchain is apt-installed (gcc, musl-tools, binutils). |
| Docker Image Cached | WARN | task.toml has no docker_image set; acceptable during development but required before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Clear deliverable: fix myld.c so linked programs run and produce correct output, with invocation contract and section behaviors spelled out. |
| Time Awareness | WARN | No explicit sandbox time bound or iterative-best-output hint is provided to the agent. |
| Tone | PASS | Reads as a conversational colleague handoff with debugging tips rather than a formal spec. |
| Length | PASS | 53 lines, well under the 100-line limit. |
| Scoring Leakage | PASS | No mention of scorer, verifier, reward, evaluation, or test.sh in instruction.md. |
| Tools Documented | PASS | Mentions make, readelf, objdump, musl-gcc, gcc, and points at <elf.h> and musl paths. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | Baseline myld.c compiles but produces non-running ELFs; structural checks are gated by execution gates in STRUCTURAL_GATES so unrun tiers contribute 0. |
| Adversarial Audit | PASS | Reward file, /tests, refdata, and stage inputs are all root-only by container-start; agent runs under su+strace and is killed before grading. |
| Agent Code As User | PASS | All agent code paths (make build, link, run) execute under `su agent -s /bin/bash -c 'env -i ...'`. |
| Strace Tracing | PASS | strace -f wraps every agent invocation (build + each link/run) and logs are scanned for reward openat and toolchain execve before scoring. |
| Verifier Protected | PASS | compute_reward.py runs with `python3 -ISs` from /tests, reads only the root-written test_results.json and /app/myld.c as text; no imports from /app. |
| Fault Tolerance | PASS | No `set -e`, EXIT trap guarantees reward.txt=0 on any early exit, every fail_with exits 0, and all subprocesses are bounded by `timeout`. |

**Acknowledged / Acceptable Gaps**
- Agent's myld shells out to a real linker via a renamed/copied binary path (e.g., `cp /usr/bin/ld /tmp/x && execve('/tmp/x', ...)`), bypassing the strace shellout regex that matches only literal toolchain basenames. — Source gate still catches the common execvp("ld"/"gcc") spellings; producing the renamed binary requires deliberate intent and the linked ELFs would still need to actually run correctly to score, so this is a soft anti-gaming heuristic the task author accepts.
- Agent hand-crafts an ELF in myld.c that prints the expected stdout/exit for each test case without performing real relocation work. — Reference outputs live root-only in /tests/refdata and are never staged to the agent; reproducing the outputs amounts to solving the task by another means rather than reward manipulation.
- Agent tampers with its own /logs/agent traces before verification. — Documented as inherent to the single-container model in HARBOR_GUIDE; only /logs/verifier matters for scoring and is locked to root before any grading.

**Existing Defenses**
- **Filesystem lockdown**: /logs/verifier chmod 700 + rm -rf as first action; /tests chmod 700 re-locked at verifier start; /tests/refdata chmod -R go-rwx so .ref answers and pristine .o/.a are unreadable by agent; STAGE chown -R root:root + chmod 644 inputs; only OUTDIR is agent-writable; .ref reference binaries removed from /app/tests at build time
- **Privilege separation**: task.toml [agent] user=agent; Verifier drops to agent uid via `su agent -s /bin/bash -c "env -i PATH=... bash ..."` for build + every link/run; pkill -9 -u agent before, between, and after agent phases
- **Runtime tracing**: strace -f -e trace=clone,clone3,fork,vfork,execve,openat wraps build and every link/run; Per-job strace log scanned for openat of reward.{txt,json} with O_WRONLY/O_RDWR/O_CREAT; Per-job strace log scanned for execve of ld/ld.gold/ld.lld/ld.bfd/gold/gcc/g++/cc1/cc1plus/collect2/musl-gcc/clang/lld and flags shellout
- **Scoring isolation**: test_results.json is written only by the root grading phase after agent processes are killed; compute_reward.py runs with `python3 -ISs` outside strace and never imports /app; Source gate inspects /app/myld.c text for banned execvp/system/popen patterns and a MIN_CODE_LINES=150 floor; Structural readelf checks gated behind matching execution test via STRUCTURAL_GATES
- **Oracle bypass integrity**: Oracle marker requires both file existence and secret token contents matching HARBOR_ORACLE_FLAG injected only into solution.env, so the agent cannot forge it

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Structural-only T4 checks (entry/sections/nostdlib) and T1/T2 ELF checks are gated behind genuine execution passes, so a baseline emitting valid-but-non-running ELFs scores 0. |
| Implementation Agnostic | PASS | Grading runs the produced ELF and diffs stdout+exit against root-owned reference outputs, measuring the deliverable's behavior independent of linker algorithm. |
| Dimension Balance | PASS | Five tiers weighted by difficulty (0.08/0.12/0.16/0.24/0.40); the easy tiers cap at ~0.36 total so the agent cannot game a high score without solving the hard musl tier. |
| Shortcut Resistant | PASS | Trivial outputs fail link/diff and score 0; banned-pattern source scan, MIN_CODE_LINES=150, and strace-based shellout detection block the obvious shell-out-to-ld shortcut. |
| Modular Scoring | PASS | compute_reward.py reads /logs/verifier/test_results.json (written by root grading phase) and never imports agent code, so it can re-run independently. |
| Reward Json Schema | PASS | Both --fail and success paths in compute_reward.py emit reward.json with score, subscores list, and additional_data via write_reward (failure path uses subscores=[{subtask:t,score:0.0} for t in TIERS]). |

**Reward Formula**: `score = clamp(sum_over_tiers(weight_t * passed_t / total_t), 0, 1); zeroed if anti-gaming triggers (banned source pattern, source too short, strace-observed shellout to ld/gcc/clang/etc., and not oracle)`
Difficulty-weighted sum across five tiers of real link+execute tests, with structural-only checks gated behind genuine execution to prevent credit for non-running ELFs.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| T1 basic ELF | pass fraction of {t1_t1_exit run, t1_t1_exit_elf structural-gated} | t1_t1_exit_elf only counts if t1_t1_exit passed / 0.08 |
| T2 cross-file | pass fraction of {t2_t2_hello, t2_t2_data, t2_t2_hello_elf structural-gated} | t2_t2_hello_elf only counts if t2_t2_hello passed / 0.12 |
| T3 bss + archive | pass fraction of {t3_t3_bss, t3_t3_archive} | none beyond execution diff / 0.16 |
| T4 musl hello + structural | pass fraction of {t4_entry, t4_sections, t4_nostdlib, t4_hello_libc} | t4_entry/sections/nostdlib only count if t4_hello_libc passed / 0.24 |
| T5 complex musl | pass fraction of {t5_printf, t5_multi, t5_common} | diff actual vs reference output / 0.40 |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Tiered tests (exit, hello, data, bss, archive, musl printf/multi/common) map directly to instruction requirements; structural T4 checks are gated behind execution. |
| Definitions Documented | PASS | ELF, relocations, archive scanning, and anti-shellout constraints are all explicit in instruction.md or standard systems knowledge. |
| Tools Accessible | PASS | Dockerfile installs build-essential, musl-tools, strace, etc.; Makefile + myld.c starter present; musl path matches instruction. |
| Oracle Exists | PASS | solution/solve.sh is 152 lines and writes a working ld/gcc wrapper plus the oracle marker. |
| Hidden Test Fairness | PASS | All graded cases are structural variants of the documented requirement (valid running ELF executables linking the provided test inputs). |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | PASS | Slim base, cache cleaned, every installed package (build-essential, musl-tools/dev, git, tmux, strace, procps) is genuinely used by build or verifier. |
| Solution Clean | PASS | Only solve.sh present; embeds the C source inline and writes the oracle marker correctly. |
| Testsh Quality | WARN | All major sections are justified by the threat model, but two lines are defensive duplicates of Dockerfile state. |
| Git Hygiene | PASS | No individual files exceed 30MB; repo is text-only sources plus small assembly/C test inputs. |
| Workspace Clean | PASS | Workspace contains only Makefile, myld.c, start.S, syscalls.S, and test inputs — no dead code or stale configs. |

**Cleanup Suggestions**
- `tests/test.sh`: line 49: chmod -R go-rwx "$REFDATA" — Dockerfile already applies chmod -R go-rwx /tests/refdata at build time; /tests is root-only so the agent cannot alter it between phases.
- `tests/test.sh`: line 55: find /tests -name '*.sh' -exec chmod +x — The only .sh in /tests is test.sh (already executable to be invoked); the runtime RUNNER script is created in $STAGE, not /tests.
- `tests/compute_reward.py`: line 152: duplicate 'reward' key alongside 'score' in reward.json payload — reward.json schema specifies only 'score'; the extra top-level 'reward' field is a stray key not in the documented schema.


### Notes

- **Format Check**: Move tests/compute_reward.py to environment/tests/compute_reward.py and add a COPY directive in the Dockerfile so it is bundled into /tests at image build time.
- **Format Check**: Remove or rename job-local.yaml, or add a .gitignore entry if it is a local-only override.
- **Reproducibility**: Set [environment].docker_image to a prebuilt registry image before final delivery.
- **Instruction Quality**: Consider adding a one-line hint about the sandbox time budget (e.g., 'you have up to 2 hours') or suggesting the agent keep myld.c in a runnable state across iterations.
- **Cleanliness**: test.sh is dense but every section maps to a real attack vector given the single-container model — keep as-is or trim only the two defensive duplicates noted.
- **Cleanliness**: Consider moving the extra 'reward' top-level key in reward.json into additional_data to match the documented schema strictly.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

> **STALE — inherited from the `elf-linker-from-scratch` (stub) variant.** The numbers below describe rollouts against the 8-line stub baseline (0.0), not this "fix the implementation" variant, which ships a partial linker at baseline 0.2. Re-run rollouts for this task before trusting these results.

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
