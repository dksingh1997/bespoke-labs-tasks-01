# Rust ls clone color filtering

> Implement a Rust clone of GNU coreutils ls focused on colorized output, ignore/hide filtering, SELinux context, and complex flag combinations. The binary at /app/workspace/rls must match GNU ls byte-for-byte for the targeted feature set.

---

## Task Configuration

| Property | Value |
|----------|-------|
| Difficulty | hard |
| Category | programming |
| Agent Timeout | 7200s |
| Verifier Timeout | 3600s |
| Internet Access | Disabled |
| CPUs / Memory | 2 / 8192 MB |

---

## Pre-Rollout QA

> 34 PASS, 5 WARN, 0 FAIL — **WARN** | 237.6s | $6.00
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | All required files present (instruction.md, task.toml, environment/Dockerfile, tests/test.sh). |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=3600, build_timeout_sec=600, agent.user='agent'. |
| Dockerfile Required Tools | PASS | Dockerfile installs both git and tmux. |
| Tests Folder Lean | WARN | tests/ contains compute_reward.py and run_all.py alongside test.sh; should live in environment/tests/ and be bundled via Dockerfile COPY. |
| Directory Cleanliness | WARN | ANTI_CHEAT.md is a stray file at task root (no .gitignore present to ignore it). |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml sets [agent] user = "agent". |
| Dockerfile Isolation | PASS | All required isolation primitives present in Dockerfile. |
| Testsh Isolation | PASS | test.sh hardens /logs/verifier first, runs agent code under strace as agent user, scores outside strace, always exits 0. |
| Verifier Type | PASS | runs_agent_code — verifier executes build.rs via cargo build and runs the agent's rls binary; strace + su agent + env -i are all in place. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | No Python pip installs and no Rust project at build time; only apt packages and rustup toolchain, neither of which supports a lockfile. |
| Package Manager | N/A | Dockerfile installs no Python packages via pip or uv; only apt and rustup are used. |
| Docker Image Cached | WARN | task.toml has no docker_image field; expected during development but must be set before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable, invocation, flags, env vars, and output format are unambiguously specified. |
| Time Awareness | PASS | Explicit 2-hour (7200s) limit with guidance to finalize and copy binary near the end. |
| Tone | PASS | Direct technical tone with practical tips section; reads like a colleague handoff. |
| Length | WARN | 123 lines, slightly over the 100-line target; tables and tips could move to a workspace doc. |
| Scoring Leakage | PASS | No mention of scorer, verifier, reward, or test.sh; only references a per-case timeout. |
| Tools Documented | PASS | Rust toolchain, allowed crates, and fixture/example locations are clearly documented. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | No Cargo.toml in workspace causes emit_fail 'not_a_rust_project' with score 0.0. |
| Adversarial Audit | PASS | Lock+wipe /logs/verifier, env -i, agent UID, strace tripwires for reward writes and execve of ls/dir/vdir/oracle, pkill, static greps, and binary picked by Cargo metadata. |
| Agent Code As User | PASS | cargo build and rls binary execution both wrapped in `su agent -s /bin/bash -c` under strace -f. |
| Strace Tracing | PASS | strace -f wraps build (build.rs) and each per-case agent run; logs scanned for reward writes and banned execve before scoring. |
| Verifier Protected | PASS | compute_reward.py runs as `python3 -ISs` from /tests, reads only CLI args and subscores file, never imports /app. |
| Fault Tolerance | PASS | All failure paths call emit_fail then exit 0; build has timeout 3000, per-case runs use timeout+strace timeout+30. |

**Acknowledged / Acceptable Gaps**
- build.rs can drop a precompiled non-Rust ELF at target/release/<binname> — Static greps catch coreutils/uutils Cargo deps and forbidden refs; the dropped binary still has to behave like GNU ls byte-for-byte under env -i with no access to /oracle, oracle.enc key, or coreutils variants — legitimate task latitude.
- /logs/agent (777) is agent-writable and traces may be tampered — Documented in HARBOR model as not preventable in single-container design; does not affect scoring.
- Workspace /app is agent-owned and read by oracle-side staging only of /tests/fixtures (not /app) — Oracle and agent both read the root-staged STAGE_DIR/fixtures, not /app — agent /app mutations cannot influence oracle output.

**Existing Defenses**
- **Filesystem lockdown**: chmod 700 + wipe /logs/verifier first; re-assert chmod 700 /tests and strip go-rwx after Harbor upload; root-only WORK_DIR/STRACE_DIR/oracle decrypt
- **User separation**: cargo build and rls execution run as `agent` user via `su agent -c`; agent cannot write /etc, /usr/bin, /tests, /logs/verifier
- **Process isolation**: strace -f blocks until all forked descendants exit; pre-verification pkill -u agent with retry; env -i scrubs LD_PRELOAD/PYTHONPATH/CARGO_* before agent exec
- **Reward tamper tripwires**: strace openat(reward.txt|json, O_WRONLY|O_RDWR|O_CREAT) check on build.rs and each per-case run; atomic reward write via tmpfile + os.replace
- **Oracle/binary anti-cheat**: oracle ls AES-decrypted root-side with ELF validation; execve of ls/dir/vdir/oracle basename is a cheat; system ls/dir/vdir replaced with stubs; submitted binary sha256 != oracle sha256 check; binary picked strictly by Cargo.toml [[bin]].name / package.name with pre-build rm of candidate paths

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Each test requires byte-exact diff against GNU ls output; mismatches and build failures score 0. |
| Implementation Agnostic | PASS | Reward is solely output equivalence to GNU ls, so any Rust implementation that matches bytes scores equally regardless of internal algorithm. |
| Dimension Balance | PASS | Sub-dimensions (color, ignore/hide, -Z context, flag combos) are all flattened into one tier as equally weighted binary test cases, so no single dimension is trivially maxable nor unreasonably hard relative to the others. |
| Shortcut Resistant | PASS | Empty/constant/copy-input outputs fail byte-exact diff against GNU ls; build-from-source enforcement plus oracle-binary hash check block trivial cheats. |
| Modular Scoring | PASS | compute_reward.py runs outside strace, reads only a subscores file, and never imports agent code so it can be re-run independently. |
| Reward Json Schema | PASS | All paths (success, --fail, --fail --cheat) write score (float), subscores (list, [] on failure), and additional_data via atomic tmpfile+os.replace. |

**Reward Formula**: `score = sum_over_tiers( (tier_pass / tier_total) * WEIGHTS[tier] ), clamped to [0,1]; only tier8_color_advanced is in scope with weight 1.0, so score = tier8_pass / tier8_total`
Pass-rate within the single in-scope tier, where each test is a binary byte-exact diff against GNU ls reference output.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| tier8_color_advanced | fraction of tier8 test cases whose normalized stdout matches GNU ls byte-for-byte | build-from-source required, banned-crate/anti-cheat static greps, strace tripwire on reward writes or execve of ls/dir/vdir/oracle, sha256 not equal to oracle / 1.0 |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Verifier scores tier8 (color, ignore/hide, -Z context, and flag combos), all explicitly described in instruction.md. |
| Definitions Documented | PASS | LS_COLORS value, environment variables, override semantics, and -f side effects are all documented in instruction.md. |
| Tools Accessible | PASS | Rust toolchain installed system-wide; example fixtures and expected outputs populated under /app/workspace/examples by build_tests.py. |
| Oracle Exists | PASS | solution/solve.sh exists, is non-empty, writes oracle marker, and decrypts the baked GNU ls binary into /app/workspace/rls. |
| Hidden Test Fairness | PASS | Tests are structural variants of GNU ls behavior on documented flags; specific combos like -laSr, -latr, -RlF are enumerated in instruction.md. |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | WARN | Slim base + cache cleaned, but bc is unused and gcc/g++/make duplicate build-essential. |
| Solution Clean | PASS | Only solve.sh present; oracle marker + decrypt logic is minimal and correct. |
| Testsh Quality | PASS | Every section serves a clear purpose for this multi-phase build-and-diff verifier. |
| Git Hygiene | PASS | No individual files exceed 30MB. |
| Workspace Clean | PASS | Workspace is empty apart from examples/README.md placeholder; fixtures/tests are generated at image build time. |

**Cleanup Suggestions**
- `environment/Dockerfile`: apt package: bc — Scoring is fully in Python (compute_reward.py); the only mention of bc is a stale comment referring to the old shell/bc implementation.
- `environment/Dockerfile`: apt packages: gcc, g++, make — build-essential already pulls in gcc, g++, and make on Debian — listing them separately is duplication.
- `tests/test.sh`: find /tests -type f -name '*.sh' -exec chmod +x — No helper .sh scripts live in /tests besides test.sh itself; the Modal exec-bit workaround is a no-op here.
- `tests/`: compute_reward.py and run_all.py at task-root tests/ — Harbor convention puts only test.sh at task-root tests/ and bundles other verifier assets via environment/tests/ COPYed into the image; current layout still works because Harbor's docker cp merges them in, but it deviates from the documented convention.


### Notes

- **Format Check**: Move tests/compute_reward.py and tests/run_all.py into environment/tests/ and update the Dockerfile to COPY them into /tests at build time so tests/ contains only test.sh.
- **Format Check**: Either remove ANTI_CHEAT.md from the task root or add a .gitignore that excludes it (and other dev-only files) so the directory stays clean.
- **Reproducibility**: Set [environment].docker_image to a prebuilt registry image before final delivery.
- **Instruction Quality**: Consider trimming Tips/Required Flags tables to a workspace REFERENCE.md to bring instruction.md under 100 lines.
- **Cleanliness**: Drop bc from the Dockerfile and remove the stale shell/bc comment in compute_reward.py.
- **Cleanliness**: Trim gcc/g++/make from the apt list — build-essential covers them.
- **Cleanliness**: Consider moving compute_reward.py and run_all.py to environment/tests/ to match the Harbor convention (keeps tests/ at task root = test.sh only).

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/rust-ls-color-advanced` to populate.*
<!-- END:ROLLOUT_RESULTS -->
