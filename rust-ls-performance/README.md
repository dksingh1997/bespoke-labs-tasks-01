# Rust ls clone for large directories

> Build a Rust binary `rls` that mimics GNU coreutils `ls` for a 10,000-entry directory, supporting -1, -l, -S, and -C flags. Output must be byte-for-byte identical to GNU ls and each case must finish within a 60-second budget.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | medium |
| Category | programming |
| Agent Timeout | 7200s |
| Verifier Timeout | 3600s |
| Internet Access | Disabled |
| CPUs / Memory | 2 / 8192 MB |

---

## Pre-Rollout QA

> 31 PASS, 8 WARN, 0 FAIL — **WARN** | 231.8s | $6.18
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | instruction.md, task.toml, environment/Dockerfile, and tests/test.sh all present. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=3600, build_timeout_sec=600, agent.user='agent' all defined. |
| Dockerfile Required Tools | PASS | git and tmux are installed via apt-get in the Dockerfile. |
| Tests Folder Lean | WARN | tests/ contains extra files beyond test.sh: compute_reward.py and run_all.py. |
| Directory Cleanliness | WARN | Stray ANTI_CHEAT.md at task root (no .gitignore present). |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml sets [agent] user = "agent". |
| Dockerfile Isolation | PASS | Dockerfile creates agent user, locks /tests 700, owns /app and /solution to agent, installs strace. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier 700 then wipes, runs agent binary as agent under strace with env -i, scores outside strace, always exits 0. |
| Verifier Type | PASS | runs_agent_code — verifier builds the agent's Rust crate and executes the produced binary on fixtures. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | No external language dependencies (no Cargo.toml, no Python third-party packages); apt and rustup install only. |
| Package Manager | N/A | No Python or Rust dependency manifests; verifier/build scripts use stdlib only. |
| Docker Image Cached | WARN | task.toml does not set docker_image; expected during development but required before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable, flags, env vars, and output behavior are clearly specified. |
| Time Awareness | PASS | Instruction states the 2-hour sandbox budget and per-case 60s timeout explicitly. |
| Tone | PASS | Reads as a crisp engineering brief, slightly spec-like but appropriate for the task. |
| Length | PASS | 95 lines, under the 100-line cap. |
| Scoring Leakage | WARN | Uses an 'Evaluation' section and 'scores 0 for that case' phrasing that surfaces verifier mechanics. |
| Tools Documented | PASS | Mentions Rust, cargo, allowed crates (libc, nix, clap), and fixture locations. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | No Cargo.toml in workspace triggers emit_fail('not_a_rust_project', 0) yielding score 0.0. |
| Adversarial Audit | PASS | Multi-layer hardening: env -i, agent user, strace tripwires for both build.rs and run phase, encrypted oracle with key only in root-only test.sh, /tests at 700, atomic reward write. |
| Agent Code As User | PASS | Both cargo build (build.rs) and the agent binary execute via `su agent -c` with env -i. |
| Strace Tracing | PASS | strace -f wraps build.rs and each per-case agent run; logs scanned for reward-file openat and banned execve before scoring. |
| Verifier Protected | PASS | compute_reward.py uses python3 -ISs, never imports /app, runs from /tests, writes reward atomically via os.replace. |
| Fault Tolerance | PASS | Every failure path calls emit_fail then exit 0; strace/build/run all wrapped with timeout commands. |

**Acknowledged / Acceptable Gaps**
- Agent could vendor GNU coreutils ls source into Cargo project and call into it via FFI/build script — Not a reward hack per se; the deliverable would still be a built-from-source binary producing matching output. Out-of-scope for reward-hacking audit; would require source-similarity detection.
- /logs/agent traces remain agent-writable — Documented in spec as inherent to single-container model; agent trace tampering does not affect reward score.
- tests/ in repo contains compute_reward.py and run_all.py beyond test.sh — Spec recommends only test.sh in tests/, but here Dockerfile does not depend on baked tests/ scripts and Harbor's upload merge replaces them with the canonical copies; no reward-hacking impact.

**Existing Defenses**
- **Filesystem lockdown**: /tests baked at chmod 700 with go-rwx stripped except fixtures subtree; /logs/verifier chmod 700 + wipe at test.sh start; Agent runs as non-root 'agent' user; Decrypted oracle ls lives in root-only WORK_DIR (mktemp -d, 700)
- **Oracle protection**: Oracle binary encrypted with AES-256-CBC, key only in test.sh (root-only); Single Docker layer for oracle creation+encryption so plaintext never persists; ELF validation after decrypt to detect ciphertext tampering; /usr/bin/ls, dir, vdir replaced with error stubs
- **Strace tripwires**: build.rs strace catches reward-file openat with write flags during build; Per-case run strace catches reward openat AND banned execve (ls/dir/vdir/oracle basename); env -i strips ORACLE/FIXTURES/TESTS_DEFS_DIR from agent process env
- **Build integrity**: Prebuilt binaries deleted before cargo build (legacy 'rls' name + all Cargo.toml-resolved candidates); Binary selected by Cargo.toml bin/package name, not glob; SHA256 hash check rejects byte-identical copy of decrypted oracle
- **Static workspace greps**: Catches references to /oracle/, .test_data, oracle.enc, decryption key, reward.txt/json, /logs/verifier, uutils/coreutils, ls_backup, dir/vdir paths

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Each case requires byte-exact diff vs GNU ls output (post trailing-whitespace normalization); any mismatch, timeout, crash, or empty output scores 0 for that case. |
| Implementation Agnostic | PASS | Scoring is purely output-equivalence to GNU ls; any Rust implementation that produces matching bytes within 60s scores full credit regardless of algorithm. |
| Dimension Balance | PASS | Five flag-mode cases (no-flags, -1, -l, -S, -C) sit in one tier; each is independent binary pass/fail so gaming one cannot inflate others, and no case is unreasonably hard within 60s for buffered, syscall-aware Rust code. |
| Shortcut Resistant | PASS | Trivial outputs (empty, constants, copying input) cannot byte-match GNU ls over a 10k-entry fixture, and direct shortcuts (calling ls/dir/vdir, shipping the oracle binary) are blocked by execve tripwire, sha256 identity check, banned-crate grep, and build-from-source enforcement. |
| Modular Scoring | PASS | compute_reward.py runs standalone outside strace under `python3 -ISs`, reads only a verifier-written subscores file, and never imports or touches /app or agent code. |
| Reward Json Schema | PASS | Both success (emit_score) and failure (emit_fail) paths atomically write reward.json with score, subscores list, and additional_data plus a single-float reward.txt; failure path uses subscores=[]. |

**Reward Formula**: `score = WEIGHTS['tier9_performance'] * (sum(case_pass) / 5), with WEIGHTS['tier9_performance']=1.0; cheating multiplier 0.0 on tripwire hit; hard-fail paths return 0.0`
Single in-scope tier with five equal-weight binary correctness cases under a 60s per-case timeout, reduced to its pass-rate and clamped to [0,1].

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| t9_perf_no_flags | byte-exact diff vs GNU ls on perf_10k (no flags) | 60s timeout, exact match required / 0.2 of tier (tier weight 1.0) |
| t9_perf_one_col | byte-exact diff vs GNU ls -1 on perf_10k | 60s timeout, exact match required / 0.2 of tier (tier weight 1.0) |
| t9_perf_long | byte-exact diff vs GNU ls -l on perf_10k | 60s timeout, exact match required / 0.2 of tier (tier weight 1.0) |
| t9_perf_sort_size | byte-exact diff vs GNU ls -S on perf_10k | 60s timeout, exact match required / 0.2 of tier (tier weight 1.0) |
| t9_perf_columns | byte-exact diff vs GNU ls -C on perf_10k | 60s timeout, exact match required / 0.2 of tier (tier weight 1.0) |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | WARN | Verifier requires a Cargo project (Cargo.toml + cargo build --release) and picks the binary from target/release/<bin-name>, but instruction.md only says 'implement in Rust' and 'final binary at /app/workspace/rls' without explicitly stating a Cargo crate is required. |
| Definitions Documented | PASS | GNU ls behavior, the five flag cases, output normalization (trailing whitespace), env vars (LC_ALL/COLUMNS/TZ/TERM), and the 60s per-case budget are all documented in instruction.md. |
| Tools Accessible | WARN | Rust toolchain is installed system-wide and on PATH for the agent user, and /app/fixtures/perf_10k plus /app/tests/ exist as promised; however the scoped build never produces examples/basic/ or examples/expected/*.txt, so the workspace examples/README.md points to files that do not exist in this variant. |
| Oracle Exists | PASS | solution/solve.sh exists, is non-empty (19 lines), writes the HARBOR_ORACLE_FLAG marker, and decrypts the baked oracle ls to /app/workspace/rls. |
| Hidden Test Fairness | PASS | The five hidden tier9_performance cases (no flags, -1, -l, -S, -C on perf_10k) are exactly the five cases instruction.md enumerates, so the hidden suite is a structural variant of disclosed requirements. |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | WARN | Slim base and apt cache cleaned, but gcc/g++/make duplicate build-essential and bc is unused. |
| Solution Clean | PASS | solution/ contains only solve.sh; no stray files. |
| Testsh Quality | WARN | Hardened pattern is correct; a couple of defenses are belt-and-suspenders given user separation. |
| Git Hygiene | PASS | No individual file exceeds 30MB; total repo is under 1MB. |
| Workspace Clean | PASS | No dead code or stale configs in environment/workspace; only an examples/README.md placeholder. |

**Cleanup Suggestions**
- `environment/Dockerfile`: gcc, g++, make — build-essential already installs the GNU C/C++ toolchain and make; listing them separately is duplicate
- `environment/Dockerfile`: bc — no shell script in tests/ or environment/ invokes bc — the only mention is a comment in compute_reward.py referring to legacy shell/bc scoring that was replaced by Python
- `tests/test.sh`: unset LD_PRELOAD LD_LIBRARY_PATH PYTHONPATH PYTHONHOME BASH_ENV ENV CARGO_HOME ... — agent runs as non-root and cannot mutate /etc/ld.so.preload or root shell profiles; verifier launches in a fresh root exec that doesn't inherit the agent's environment, so these unsets are defensive only
- `tests/test.sh`: pkill -u agent + survival-check refuse-to-score block (lines 78-87) — strace -f around the agent build/run already blocks until all descendants exit, and chmod 700 of /logs/verifier earlier removes the write target; surviving processes cannot affect the reward path


### Notes

- **Format Check**: Move tests/compute_reward.py and tests/run_all.py into environment/tests/ and COPY them into the Docker image so tests/ contains only test.sh.
- **Format Check**: Remove ANTI_CHEAT.md from the task root or add a .gitignore that excludes it.
- **Reproducibility**: Set [environment].docker_image to a prebuilt registry image before final delivery.
- **Instruction Quality**: Consider renaming the 'Evaluation' section to something like 'Output Expectations' and rephrasing the per-case timeout note to avoid the word 'scores'.
- **Fairness**: Add one sentence to instruction.md stating the deliverable is a Cargo crate rooted at /app/workspace/ (with Cargo.toml) that produces target/release/<binname>, so the build-from-source requirement is not implicit.
- **Fairness**: Either fix examples/README.md to describe what the perf-scoped workspace actually contains (perf_10k fixture under /app/fixtures, tier9 JSON specs under /app/tests), or have create_examples() also seed a small example from perf_10k so the README's diff command works out of the box.
- **Cleanliness**: Drop gcc/g++/make/bc from the apt-get install list in environment/Dockerfile.
- **Cleanliness**: Consider removing the LD_*/PYTHON*/BASH_ENV unset block and the pre-strace agent-kill survival check from tests/test.sh — they are redundant under the documented hardened model.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/rust-ls-performance` to populate.*
<!-- END:ROLLOUT_RESULTS -->
