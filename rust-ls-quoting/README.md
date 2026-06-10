# Rust ls quoting and escaping clone

> Implement a Rust binary at /app/workspace/rls that reproduces GNU coreutils ls name quoting and escaping. Must support -b, -q, -Q, -N, --show-control-chars, and --quoting-style across literal, shell*, c, and escape styles with byte-exact output.

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

> 32 PASS, 6 WARN, 0 FAIL — **WARN** | 242.8s | $7.16
### Format Check

| Check | Status | Detail |
|-------|--------|--------|
| Required Files | PASS | instruction.md, task.toml, environment/Dockerfile, and tests/test.sh all exist. |
| Recommended Files | PASS | solution/solve.sh, oracle.yaml, and job.yaml all present. |
| Task Toml Schema | PASS | allow_internet=false, agent.timeout_sec=7200, verifier.timeout_sec=3600, build_timeout_sec=600, agent.user='agent'. |
| Dockerfile Required Tools | PASS | Dockerfile installs git and tmux via apt-get. |
| Tests Folder Lean | WARN | tests/ contains extra files (compute_reward.py, run_all.py) that should live in environment/tests/. |
| Directory Cleanliness | WARN | Stray ANTI_CHEAT.md file at task root; no .gitignore present. |

### Isolation

| Check | Status | Detail |
|-------|--------|--------|
| Agent User | PASS | task.toml sets [agent] user = "agent" (line 10). |
| Dockerfile Isolation | PASS | All required isolation primitives present in Dockerfile. |
| Testsh Isolation | PASS | test.sh locks /logs/verifier first, wipes, runs agent code only under su agent + strace + timeout, and scores outside strace. |
| Verifier Type | PASS | runs_agent_code: cargo build executes agent build.rs and the compiled rls binary is invoked per test case. |

### Reproducibility

| Check | Status | Detail |
|-------|--------|--------|
| Lockfile | N/A | Task ships no application dependency manifest (no Cargo.toml/pyproject/package.json); agent writes their own Cargo project from scratch. |
| Package Manager | N/A | No Python or Node packages are installed; only apt packages and rustup toolchain via shell script. |
| Docker Image Cached | WARN | task.toml has no docker_image field set; expected during development but required before final delivery. |

### Instruction Quality

| Check | Status | Detail |
|-------|--------|--------|
| Clarity | PASS | Deliverable, location, flags, styles, and matching criterion against GNU ls are clearly specified. |
| Time Awareness | PASS | Explicit 2-hour budget with guidance to finalize binary in the last ~10 minutes. |
| Tone | PASS | Clear, direct, mostly colleague-style with tips and a getting-started pointer. |
| Length | PASS | 115 lines, just over 100 but justified by the flag/style reference tables. |
| Scoring Leakage | WARN | Section header 'Evaluation' and phrases 'hidden suite', 'each test', 'per-case timeout' leak the existence of an evaluation harness. |
| Tools Documented | PASS | Rust, cargo, allowed crates, and fixture/example locations are documented. |

### Reward Hacking

| Check | Status | Detail |
|-------|--------|--------|
| Noop Baseline | PASS | No-op agent leaves /app/workspace without Cargo.toml, triggering not_a_rust_project fail path with score 0.0. |
| Adversarial Audit | PASS | Filesystem locked, /tests root-only, agent code runs as 'agent' under strace with env -i and tripwires for reward writes + execve of ls/dir/vdir/oracle, prebuilt-binary candidates wiped before build, oracle hash check, anti-cheat greps; environment is restored (chmod 700 /tests, /logs/verifier wipe, pre-existing agent processes killed) before verification. |
| Agent Code As User | PASS | Cargo build and agent binary execution both go through 'su agent -s /bin/bash -c' so agent code never runs as root. |
| Strace Tracing | PASS | Both the build phase and every per-case agent invocation are wrapped in 'strace -f' with logs scanned for reward-file openat and banned execve before any scoring. |
| Verifier Protected | PASS | compute_reward.py uses 'python3 -ISs', reads only CLI args plus the verifier-written subscores file, and never imports or reads from /app. |
| Fault Tolerance | PASS | No 'set -euo pipefail'; every failure path calls emit_fail and exits 0; build and per-case agent runs have explicit timeouts. |

**Acknowledged / Acceptable Gaps**
- Agent can modify its own /logs/agent traces during agent phase — Documented as inherent to single-container model; does not affect scoring.
- Staged fixtures under /tests/fixtures are world-readable by design — Explicitly commented: agent already has informational copies in /app/fixtures, and the staged copy is required so the agent-UID binary can read fixtures whose modes ls -l must report.

**Existing Defenses**
- **Filesystem lockdown**: chmod 700 /logs/verifier then wipe before scoring; chmod 700 /tests re-asserted plus go-rwx stripped from non-fixture files; /app/.test_data/oracle.enc decryption key lives only in test.sh, not the image
- **User separation**: Agent runs as non-root 'agent' user (task.toml); cargo build --release executed via 'su agent' under env -i; Per-case agent binary executed via 'su agent' under env -i with PATH scrubbed
- **Runtime auditing**: strace -f wraps build phase, log scanned for reward.{txt,json} O_WRONLY/O_RDWR/O_CREAT; strace -f wraps each agent run; tripwires for reward writes and execve of ls/dir/vdir/oracle basename; Pre-existing agent processes pkilled with retry; abort if any survive
- **Build integrity**: Candidate target/release/<binname> paths wiped before cargo build; Built binary copied to root-owned BIN_DIR (agent cannot replace mid-run); Bin name resolved from Cargo.toml [[bin]]/package metadata, not glob; Oracle ls baked into image but encrypted; system ls/dir/vdir replaced with error stubs
- **Scoring isolation**: compute_reward.py runs outside strace, as python3 -ISs, with only --output-dir and --subscores; reward.json/reward.txt written atomically via tmp + os.replace; Static workspace anti-cheat greps for oracle path / key / reward references / banned crates / dir-vdir / hash-identical to oracle

### Reward Design

| Check | Status | Detail |
|-------|--------|--------|
| Correctness Gating | PASS | Exact byte-diff against GNU ls oracle output per test; build failure, missing binary, or wrong output all score 0. |
| Implementation Agnostic | PASS | Metric is byte-equal output vs GNU ls — any Rust implementation reproducing the quoting bytes scores equally. |
| Dimension Balance | N/A | Single-metric task (per-test exact-output equality) aggregated as uniform pass-rate; no multi-dimension aggregation. |
| Shortcut Resistant | PASS | Empty/constant/oracle-copy outputs cannot match the oracle's quoted output for special_names fixtures; static + strace anti-cheat blocks execve(ls/dir/vdir/oracle) and reward writes. |
| Modular Scoring | PASS | compute_reward.py runs outside strace and only reads a verifier-written subscores.txt; no agent code is re-executed during scoring. |
| Reward Json Schema | PASS | Both success and failure paths write score (float), subscores (list, [] on failure), additional_data; reward.txt also written atomically and test.sh always exits 0. |

**Reward Formula**: `score = sum_tier( (passed_tier / total_tier) * weight_tier )  where only tier6_quoting_escaping is in-scope with weight=1.0; gated to 0.0 on build-fail / oracle-decrypt-fail / anti-cheat / strace tripwire (cheating_penalty_multiplier=0)`
Pass-rate over ~33 hidden quoting/escaping test cases scored as byte-equal-output vs GNU ls (the trusted oracle), with hard zero gates for non-Rust builds, missing binary, and reward/oracle tampering.

| Component | Metric | Gate / Weight |
|-----------|--------|---------------|
| tier6_quoting_escaping | fraction of cases where normalized agent stdout == normalized GNU ls stdout (trailing-whitespace stripped) | build-from-source must succeed; no execve of ls/dir/vdir/oracle; no write-open of reward.{txt,json}; binary != oracle hash; static workspace anti-cheat clean / 1.0 (sole in-scope tier, re-normalized from parent-task weights) |

### Fairness

| Check | Status | Detail |
|-------|--------|--------|
| Instruction Verifier Sync | PASS | Verifier scores Tier 6 quoting/escaping cases (including -lb/-lQ/-lN and a no-flag default case); all flags, quoting styles, and the shell-escape default for non-terminal output are documented in instruction.md. |
| Definitions Documented | PASS | All required flags, each named quoting style's semantics, byte-level LC_ALL=C interpretation, and shell-quoting rules are spelled out; -l long format relies on standard GNU ls knowledge, which is acceptable. |
| Tools Accessible | PASS | Rust toolchain is installed system-wide with a+rX so the non-root agent user can run cargo; /app/workspace/examples, /app/fixtures, and /app/tests referenced in instruction.md exist after Docker build. |
| Oracle Exists | PASS | solution/solve.sh exists, is non-empty, writes the oracle marker, and decrypts the baked GNU ls into /app/workspace/rls. |
| Hidden Test Fairness | PASS | Hidden tests are structural variants of documented flag/style combinations over the fixture set described in instruction.md (special_names, basic, mixed, symlinks). |

### Cleanliness

| Check | Status | Detail |
|-------|--------|--------|
| Dockerfile Quality | WARN | Slim base and cache cleaned, but gcc/g++/make duplicate build-essential and bc is never invoked anywhere. |
| Solution Clean | PASS | Only solve.sh present in /solution. |
| Testsh Quality | WARN | Most sections are justified by the strace+build-from-source threat model, but one helper is redundant. |
| Git Hygiene | PASS | No individual files exceed 30MB. |
| Workspace Clean | PASS | Workspace contains only examples/README.md; build_tests.py runs at build time and is deleted in the same layer. |

**Cleanup Suggestions**
- `environment/Dockerfile`: gcc, g++, make packages — build-essential already pulls these in as dependencies
- `environment/Dockerfile`: bc package — no shell/python code in tests/ or solution/ calls bc; reward math is in compute_reward.py
- `tests/test.sh`: line 71: find /tests -name '*.sh' -exec chmod +x — test.sh is the only .sh under /tests; compute_reward.py and run_all.py are .py and invoked via python3


### Notes

- **Format Check**: Move tests/compute_reward.py and tests/run_all.py to environment/tests/ and COPY them into the image at build time; tests/ should contain only test.sh.
- **Format Check**: Remove or relocate ANTI_CHEAT.md (e.g., into docs/ or merge into README.md) so the task root contains only Harbor-recognized files.
- **Format Check**: Add a .gitignore to exclude jobs/, results/, qa-logs/, __pycache__/, and .DS_Store.
- **Isolation**: tests/ at task root contains run_all.py and compute_reward.py in addition to test.sh; guide recommends test.sh only with other assets under environment/tests/, but this does not affect isolation since /tests is locked 700 and Harbor merge-upload only overwrites by name.
- **Reproducibility**: Set [environment].docker_image to a prebuilt registry image before final delivery to pin the rustup-installed toolchain and apt package versions.
- **Instruction Quality**: Rename '## Evaluation' to something like '## Output Matching' and drop 'hidden suite'/'Each test has a per-case timeout' phrasing; describe the per-invocation timeout as a general runtime guideline instead.
- **Instruction Quality**: Consider trimming the long Output Behavior bullet list into a brief overview plus a link/pointer to a docs file to bring length under 100 lines.
- **Cleanliness**: Drop gcc/g++/make/bc from the apt-get line to shrink the image
- **Cleanliness**: Remove the unused chmod +x find on test.sh line 71

---

<!-- BEGIN:ROLLOUT_RESULTS -->
## Rollout Results

*Not yet generated. Run `harbor-qa-post --task-dir /Users/dheeraj/Downloads/refactor/bespoke-labs-tasks-01/rust-ls-quoting` to populate.*
<!-- END:ROLLOUT_RESULTS -->
