# Rust ls clone core

> Build a Rust binary at /app/workspace/rls that clones GNU coreutils ls. Must support listing/filtering, long-format, and sorting flags with byte-identical output to GNU ls.

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

> 31 PASS, 10 WARN, 0 FAIL — **WARN** | 216.9s | $6.76
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | All required files present. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | All required fields present and within limits. |
| Dockerfile Required Tools | PASS | git and tmux are installed via apt-get. |
| Tests Folder Lean | WARN | tests/ contains extra files beyond test.sh. |
| Directory Cleanliness | WARN | Stray ANTI_CHEAT.md at task root. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml [agent] user = "agent" is set. |
| Dockerfile Isolation | PASS | All required isolation primitives present in Dockerfile. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first, runs agent build under su+strace+timeout, scores outside strace, and always exits 0. |
| Verifier Type | PASS | runs_agent_code — verifier compiles and executes the agent's Rust binary. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | PASS | No external Python or Cargo dependencies are declared in the task; Rust toolchain is installed via rustup and no Cargo.toml/requirements files exist. |
| Package Manager | PASS | No Python packages are installed via pip in the Dockerfile; only apt packages and rustup toolchain are used. |
| Docker Image Cached | WARN | task.toml does not set docker_image; expected during development but must be set before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable, invocation, flags, env vars, and output format are clearly specified. |
| Time Awareness | PASS | Explicit 2-hour (7200s) budget with iteration guidance and a final-build reminder. |
| Tone | WARN | Largely spec-like with tables rather than conversational handoff, but readable. |
| Length | WARN | 128 lines exceeds the 100-line guideline; flag tables could move to a workspace reference doc. |
| Scoring Leakage | WARN | Contains an 'Evaluation' section describing comparison against GNU ls with normalization, which leaks verifier behavior. |
| Tools Documented | PASS | Names Rust, allowed crates (libc/nix/clap), forbids uutils, and points to /app/workspace/examples and /app/fixtures. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | Missing /app/workspace/Cargo.toml triggers emit_fail not_a_rust_project with score 0.0. |
| Adversarial Audit | PASS | Reward file lockdown, /tests root-only, env -i scrubbing, encrypted oracle, sha256 identity check, and strace tripwires close all validated attack vectors. |
| Agent Code As User | PASS | Both cargo build (build.rs) and the rls binary execute via su agent -s /bin/bash -c under strace -f. |
| Strace Tracing | PASS | strace -f wraps both the build and every per-case agent invocation; logs scanned for reward openat and banned execve before scoring. |
| Verifier Protected | PASS | compute_reward.py runs python3 -ISs, takes only argv + a root-written subscores file, never imports anything from /app. |
| Fault Tolerance | PASS | All failure paths route through emit_fail (writes 0.0 atomically) and exit 0; build/oracle/agent invocations are wrapped in timeouts. |

**Acknowledged / Acceptable Gaps**
- /logs/agent is 777 — agent can tamper with its own trajectory logs — Documented Harbor limitation; does not affect reward computation
- build.rs executes as agent user during cargo build — Necessary for Rust builds; covered by strace tripwire on reward writes and by env -i scrubbing of verifier paths
- Agent owns /app/workspace and can plant files during the agent phase — Agent binary is copied to root-owned $BIN_DIR before execution; static greps catch known cheat strings; oracle/test artifacts live in root-only /tests

**Existing Defenses**
- **Filesystem lockdown**: chmod 700 /logs/verifier then rm -rf at test.sh start; chmod 700 /tests re-asserted post-upload, go-rwx stripped on all non-fixture files; Agent binary copied to root-owned $BIN_DIR/rls 0755 before execution
- **User separation**: Agent user runs build.rs and the rls binary via su agent -s /bin/bash -c; Oracle decrypt, fixture stage, and scoring run as root outside agent reach
- **Environment isolation**: env -i wipes verifier vars (ORACLE/FIXTURES/TESTS_DEFS_DIR) for both build and runtime; test.sh unsets LD_PRELOAD/LD_LIBRARY_PATH/PYTHON*/BASH_ENV/CARGO*/RUSTFLAGS
- **Oracle protection**: GNU ls AES-256-CBC encrypted in image (key only in root-only test.sh); Decrypted oracle written to root-only WORK_DIR, ELF validated; sha256 equality check rejects byte-identical agent binary
- **Strace tripwires**: strace -f on cargo build catches build.rs reward writes; Per-case strace catches openat of reward.{txt,json} with write flags; Per-case strace catches execve of ls/dir/vdir/oracle basename

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Each test requires byte-exact diff against GNU ls output; broken/missing binary yields empty .actual file and 0 passes. |
| Implementation Agnostic | PASS | Reward measures byte-identical stdout vs GNU ls — any Rust implementation that reproduces the output scores, not tied to a specific algorithm. |
| Dimension Balance | WARN | Three equally-weighted tiers aggregated via weighted sum (≈arithmetic mean); tier1_basic is much easier than tier2_long_format, letting an agent harvest ~33% by acing only tier1. |
| Shortcut Resistant | PASS | Trivial outputs (empty, constant, copy-of-input) cannot match GNU ls's exact long-format/sorted output, and byte-diff has zero partial credit floor. |
| Modular Scoring | PASS | compute_reward.py reads only a verifier-written subscores.txt and never imports or touches /app, so it can be re-run independently. |
| Reward Json Schema | PASS | Both emit_fail and emit_score write reward.json with score (float), subscores (list, [] on failure), and additional_data (dict) atomically, plus reward.txt. |

**Reward Formula**: `score = sum_over_tiers( (passed_in_tier / total_in_tier) * weight_tier ), weights = {tier1_basic: 1/3, tier2_long_format: 1/3, tier3_sorting: 1/3}`
Per-tier pass-rate weighted sum across the three in-scope tiers, where each test is a binary byte-exact diff of agent stdout against GNU ls.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| tier1_basic | fraction of basic-listing tests with byte-exact stdout match vs GNU ls | per-test exact diff (binary 0/1) / 0.333333 |
| tier2_long_format | fraction of long-format tests with byte-exact stdout match vs GNU ls | per-test exact diff (binary 0/1) / 0.333333 |
| tier3_sorting | fraction of sorting tests with byte-exact stdout match vs GNU ls | per-test exact diff (binary 0/1) / 0.333334 |
| anti_cheat_gate | static workspace grep + strace tripwire (reward writes, execve of ls/dir/vdir/oracle) + build-from-source enforcement + oracle-hash inequality | any hit ⇒ score 0.0 with cheating_penalty_multiplier=0 / multiplicative kill-switch |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Scored tiers (1 basic, 2 long, 3 sorting), flag set, env vars (LC_ALL/TZ/COLUMNS/TERM), and trailing-whitespace-per-line normalization all match between instruction.md and run_all.py/compute_reward.py. |
| Definitions Documented | PASS | All required flags map to standard GNU ls semantics; version sort, recent-vs-old date switch, and LC_ALL=C byte-order sorting are explicitly defined in instruction.md. |
| Tools Accessible | WARN | Rust toolchain is installed system-wide and the agent user can build, but instruction.md names /app/workspace/examples/expected/t2_basic_long.txt while build_tests.py copies only the first 6 alphabetically sorted t*_basic_*.expected files — which are all tier1 (t1_basic_*), so the named t2 file never lands in the workspace. |
| Oracle Exists | PASS | solution/solve.sh exists, writes the HARBOR_ORACLE_FLAG marker, and decrypts the baked oracle ls into /app/workspace/rls. |
| Hidden Test Fairness | PASS | All test cases are structural permutations of the documented flags on documented fixture trees; no scoring dimension beyond byte-equality with GNU ls. |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | WARN | Slim base and apt cache cleaned, but `bc` is installed and never used anywhere in the verifier or build pipeline. |
| Solution Clean | PASS | Only solve.sh present; decrypts the baked oracle and writes the oracle marker — clean and minimal. |
| Testsh Quality | WARN | Core hardening is necessary and well-justified, but two minor items are stale given the actual /tests contents and image. |
| Git Hygiene | PASS | Repo is ~896K total with no individual file over 30MB; no LFS candidates. |
| Workspace Clean | PASS | environment/workspace/ contains only examples/README.md; fixtures are generated at image build time, no stale configs or dead code. |

**Cleanup Suggestions**
- `environment/Dockerfile`: `bc` package in apt-get install (line 15) and the matching comment 'verifier helpers (openssl/bc/file)' on line 3 — Scoring is fully in Python (compute_reward.py); no shell uses bc — drop the package and update the comment.
- `tests/test.sh`: `find /tests -type f -name '*.sh' -exec chmod +x {} +` (line 71) — Only test.sh exists under /tests; Harbor already chmods test.sh executable on upload. No other .sh scripts to repair.
- `tests/test.sh`: `grep -rq ls_backup /app/workspace/` static anti-cheat (lines 307-309) — The Dockerfile replaces /usr/bin/{ls,dir,vdir} in place — no ls_backup binary exists anywhere in the image, so this grep can never match a real cheat.


### Notes

- **Format Check**: Move tests/compute_reward.py and tests/run_all.py into environment/tests/ and COPY them into /tests/ in the Dockerfile, leaving only test.sh at tests/.
- **Format Check**: Remove or relocate ANTI_CHEAT.md from the task root, or add a .gitignore to exclude developer notes.
- **Reproducibility**: Set docker_image in task.toml [environment] before final delivery to pin the prebuilt image.
- **Instruction Quality**: Rename/rework the 'Evaluation' section to avoid leaking verifier mechanics (drop 'compared against', 'normalization', 'per-case timeout'); reframe as expected behavior the user cares about.
- **Instruction Quality**: Consider moving the flag tables to a reference doc under /app/workspace/ to bring the instruction under 100 lines and adopt a more conversational tone.
- **Reward Design**: Replace the weighted-sum aggregation across tiers with a power mean (e.g. p=-1 harmonic-style) or multiplicative aggregation so an agent that aces only tier1_basic cannot collect ~33% of the score while ignoring long-format and sorting.
- **Reward Design**: Alternatively, gate any tier credit on a minimum cross-tier pass threshold (e.g. require >0 passes in every tier before crediting any) to prevent single-dimension harvesting.
- **Fairness**: Fix the example diff command in instruction.md: either widen the create_examples() glob in environment/build_tests.py to also cover t2_basic_long.expected (e.g. explicitly include one per tier) or change the instruction example to a filename that is actually copied (e.g. t1_basic_no_flags.txt).
- **Cleanliness**: Remove `bc` from the apt install list and update the inline comment in environment/Dockerfile.
- **Cleanliness**: Drop the stale `find /tests ... chmod +x` line and the `ls_backup` static grep from tests/test.sh.

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/rust-ls-core` to populate.*
<!-- END:ROLLOUT_RESULTS -->
