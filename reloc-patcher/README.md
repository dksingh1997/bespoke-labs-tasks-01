# Fix x86-64 ELF static linker relocations

> An existing C implementation of a minimal x86-64 Linux static linker (myld.c) compiles and emits valid ELF but mis-handles relocations, causing cross-file calls and symbol references to misbehave. The agent must diagnose and fix the relocation logic so linked programs run and produce correct output, without shelling out to ld or gcc.

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

> 35 PASS, 4 WARN, 0 FAIL — **WARN** | 172.6s | $5.97
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | All required files present. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | All required fields present and within limits. |
| Dockerfile Required Tools | PASS | git and tmux installed via apt-get. |
| Tests Folder Lean | WARN | tests/ contains compute_reward.py in addition to test.sh; should live in environment/tests/. |
| Directory Cleanliness | PASS | No stray non-ignored files at root. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml declares [agent] user = "agent". |
| Dockerfile Isolation | PASS | All required isolation steps are present in the Dockerfile. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first then wipes, runs agent code via su agent under strace with timeout, scores outside strace, and always exits 0. |
| Verifier Type | PASS | runs_agent_code — the verifier builds and executes the agent's myld and the ELFs it produces. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | Task has no external Python/Node/Rust dependencies; only apt packages pinned by base image and musl-tools. |
| Package Manager | N/A | No Python package manager used; task is C systems-programming with apt-installed toolchain only. |
| Docker Image Cached | WARN | task.toml has no docker_image set; expected during development but must be set before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Clearly states the bug is in relocation handling, the constraint to keep a single myld.c, the invocation interface, and that the executable must actually run correctly. |
| Time Awareness | WARN | No explicit time bound or hint to keep best result updated during iteration. |
| Tone | PASS | Reads as a colleague handoff with debugging tips, not a formal spec. |
| Length | PASS | 57 lines, well under the 100-line cap. |
| Scoring Leakage | PASS | No references to scoring, verifier, reward, tests in a grading sense, or evaluation pipeline. |
| Tools Documented | PASS | Mentions make, readelf, objdump, musl-gcc, gcc, and points to musl install path and <elf.h>. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | Baseline myld.c is a stub that fails execution; structural checks are gated behind execution gates so noop yields 0.0. |
| Adversarial Audit | PASS | Reward file locked (chmod 700 + wipe), /tests 0700, agent runs under su agent with env -i, strace catches reward writes and linker shellouts via execve regardless of source obfuscation, oracle marker requires unforgeable secret token. |
| Agent Code As User | PASS | All agent build/link/run uses `su agent -s /bin/bash -c "env -i ..."` inside strace. |
| Strace Tracing | PASS | strace -f wraps both make and each link/run job; logs grepped for reward file writes (=>reward_file_manipulation fail) and for execve of ld/gcc/etc (=>shellout flag). |
| Verifier Protected | PASS | compute_reward.py only reads /logs/verifier/test_results.json (root-only) and /app/myld.c as text; executed via python3 -ISs outside strace, never imports /app code. |
| Fault Tolerance | PASS | EXIT trap guarantees reward.txt exists, fail_with always exit 0, every agent invocation wrapped in timeout (60s/120s), no `set -euo pipefail`. |

**Acknowledged / Acceptable Gaps**
- Source-substring banned-pattern scan misses exec families like execv/execl/posix_spawn — Defended at runtime: strace -f records all execve() calls and grep flags any path ending in /(ld|gcc|musl-gcc|clang|lld|collect2|...) regardless of which libc wrapper produced it.
- Agent can run benign helper binaries (as, objcopy, ar, ld-not-in-list) — These cannot link an executable from .o inputs on their own; the strace pattern covers every standard linker driver path component.
- Agent can read pristine staged .o/.a inputs in /tmp during link phase — Intentional — agent needs to read inputs to link them. They are 644 root-owned so agent cannot mutate them, only consume.
- Agent can write to its own /logs/agent traces — Documented in Harbor model as unavoidable; does not affect reward computation which reads only /logs/verifier/test_results.json.

**Existing Defenses**
- **Filesystem lockdown**: /tests chmod 700 root-owned; /tests/refdata chmod -R go-rwx (root-only .ref + pristine .o/.a); /logs/verifier chmod 700 + rm -rf before any test; Reference binaries removed from /app/tests at build time
- **Privilege separation**: Agent user non-root, runs under su agent -c; env -i strips LD_PRELOAD/PYTHONPATH/CFLAGS/etc.; Staged .o/.a copies are root-owned 644 (agent reads but cannot mutate); OUTDIR is the only agent-writable path during link
- **Runtime auditing**: strace -f on make + every link/run job (build.log + per-case logs); openat() of reward.txt|reward.json with O_WRONLY/O_RDWR/O_CREAT => fail with reward_file_manipulation; execve() of /ld|/gcc|/musl-gcc|/clang|/lld|/collect2|etc => shellout flag => 0 reward; pkill -9 -u agent before each phase to prevent cross-phase persistence
- **Anti-gaming**: Source code substring scan for execvp/system/popen banned patterns; 150 non-blank line minimum on /app/myld.c; Structural readelf checks gated behind genuine execution gates (no credit for syntactically valid but non-running ELFs); Oracle bypass requires marker file containing the secret HARBOR_ORACLE_FLAG which agent never sees
- **Scoring integrity**: test_results.json written only by root grading phase after strace fence; compute_reward.py runs python3 -ISs (isolated, no PYTHONPATH); Atomic reward write (mkstemp + os.replace); EXIT trap guarantees reward.txt fallback on any abort

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Each test diffs agent ELF stdout+exit against a root-owned reference; structural checks gated behind actual execution pass so a non-running ELF scores ~0. |
| Implementation Agnostic | PASS | Tests score the produced ELF's runtime behavior (stdout/exit) vs a reference, not how relocations were implemented; any correct linker passes. |
| Dimension Balance | PASS | Weighted sum across tiers is fine because higher tiers strictly subsume lower-tier capabilities, so the agent cannot game an easy dimension while ignoring hard ones to claim full credit. |
| Shortcut Resistant | PASS | Banned-pattern + strace exec scan blocks shelling out to ld/gcc, structural-gate-on-execution blocks valid-but-broken ELFs, and exact diff against reference output blocks degenerate outputs. |
| Modular Scoring | PASS | compute_reward.py reads test_results.json and myld.c text only; no agent code is imported or executed and it can be re-run independently. |
| Reward Json Schema | PASS | Both success and --fail paths emit reward.json with score, subscores list (one per tier, empty allowed semantics preserved), and additional_data, plus reward.txt. |

**Reward Formula**: `score = clamp01( sum_over_tiers( weight_t * (passed_t / total_t) ) ) * anti_gaming_pass; weights: T1=0.08, T2=0.12, T3=0.16, T4=0.24, T5=0.40; structural sub-tests gated by their execution-pass counterpart`
Tiered weighted sum rewards incremental linker capability (basic ELF -> cross-file -> bss/archive -> musl structural -> full musl programs) while a multiplicative anti-gaming gate zeroes the score on shellout or banned patterns.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| T1 basic ELF | diff vs reference stdout+exit on single-.o inline syscall + structural readelf gated by run | structural sub-test only counted if execution sub-test passed / 0.08 |
| T2 cross-file | diff vs reference for hello/data multi-object programs + structural gated | structural sub-test only counted if execution sub-test passed / 0.12 |
| T3 bss + archive | diff vs reference for .bss and .a-pulling programs | none beyond execution match / 0.16 |
| T4 structural + musl hello | readelf entry/.text/no-dynsym checks + musl hello run-diff | structural checks gated by t4_hello_libc execution pass / 0.24 |
| T5 complex musl | diff vs reference for printf, multi-file musl, common symbols | none beyond execution match / 0.40 |
| anti-gaming gate | strace shellout detection (ld/gcc/clang/lld/cc1/collect2/musl-gcc), banned source patterns (system/popen/execvp ld/gcc), min 150 non-blank lines, oracle marker bypass | multiplicative: failing zeroes the whole reward / multiplier |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Verifier runs the produced ELFs and diffs stdout/exit against reference binaries plus minimal readelf structural gates, matching the instruction's explicit goal that 'the executable must run correctly... actually produce the right output when executed'. |
| Definitions Documented | PASS | All required concepts (relocation types, PC-relative vs absolute, ELF object/archive handling, musl link order) are standard ELF/linker terminology and the musl crt1/crti/libc.a/crtn link order is shown verbatim in instruction.md. |
| Tools Accessible | PASS | Dockerfile installs build-essential, musl-tools, musl-dev, strace, tmux, git; workspace has myld.c (841 lines), Makefile, start.S, syscalls.S, and all referenced tests/ source files matching the verifier's tier set. |
| Oracle Exists | PASS | solution/solve.sh exists (152 lines), writes the HARBOR_ORACLE_FLAG marker and a wrapper myld.c that delegates to ld/gcc, then runs make. |
| Hidden Test Fairness | PASS | Verifier links agent's myld against root-owned pristine copies of the exact .o/.a files visible to the agent in /app/tests; no new test inputs or undocumented requirements are introduced. |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | PASS | Slim base, cache cleaned, every installed package (build-essential, musl-tools, git, tmux, strace, procps) is used by the build or verifier. |
| Solution Clean | PASS | solution/ contains only solve.sh. |
| Testsh Quality | WARN | Core defenses (lock+wipe /logs/verifier, /tests re-lock, strace+su agent, pkill, shellout detector) are all justified; minor env-unset overlap with env -i. |
| Git Hygiene | PASS | No files >30MB anywhere in the task. |
| Workspace Clean | PASS | workspace/ holds only the starter linker (myld.c, Makefile, start.S, syscalls.S) and test sources the instructions point to; no stale configs or dead files. |

**Cleanup Suggestions**
- `test.sh`: unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME BASH_ENV ENV CFLAGS CC CXX MAKEFLAGS (line 52) — All agent execution paths already use `su agent -s /bin/bash -c "env -i PATH=... bash ..."`, which discards the parent environment; the top-level unset only affects root's own strace invocation where these vars are not consulted.
- `tests/compute_reward.py`: compute_reward.py lives in tests/ at the task root — Convention is that tests/ at the task root contains only test.sh; other test assets belong in environment/tests/ and get baked into the image. Functionally fine here (Harbor uploads it next to test.sh) but inconsistent with the documented layout.


### Notes

- **Format Check**: Move tests/compute_reward.py to environment/tests/compute_reward.py and update the Dockerfile to COPY it into /tests/, so the tests/ folder at task root contains only test.sh.
- **Reproducibility**: Set [environment].docker_image to a prebuilt registry image before final delivery.
- **Instruction Quality**: Consider adding a one-line time hint (e.g., 'sandbox runs for ~2 hours; keep myld.c in a working state as you iterate').
- **Instruction Quality**: Instruction says tests/ has 'pre-compiled .o files' but the visible workspace tests/ only contains source files; either pre-build them in the image or reword to 'source files you can compile' to avoid agent confusion.
- **Cleanliness**: Consider dropping the redundant top-level `unset` line in test.sh or moving compute_reward.py under environment/tests/ to match the documented tests-dir convention.

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
