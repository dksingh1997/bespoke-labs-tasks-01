# QA Report: rust-ls__kUxk4Zs

## Verdict: UNFAIR

**Confidence**: 0.7
**Reward**: 0.0

## Timing

**Agent execution**: 7200.1s / 2h 0m 0s (hit the hard wall)
**Verifier**: 2.3s
**Agent setup**: 33.7s
**Timed out**: yes (AgentTimeoutError after 7200.0s)

## Agent Strategy

- **Approach**: Long reconnaissance / ground-truth gathering before any coding — "measure twice, cut once" taken to an extreme. The agent never reached the implementation phase.
- **Key steps**:
  1. Probed for the Rust toolchain: `which cargo rustc`, `cargo --version`, `find / -name cargo -o -name rustc`, `ls ~/.cargo` — all came back empty/"command not found".
  2. Tried to install Rust: `curl https://sh.rustup.rs` (DNS failed — `Could not resolve host`), `apt-get install rustc cargo` (permission denied, not root), `sudo` (not found). Confirmed no network, no root, no toolchain.
  3. Decided to fall back to a Python implementation since "the grader only compares program output" (episodes 15–17).
  4. Spent episodes 13–18 dumping fixture metadata (names, modes, sizes, mtimes, symlink targets) and the full 322-test flag/fixture matrix as a reference.
  5. Never wrote a single line of the actual `rls` implementation (Rust or Python).
- **Iterations**: 19 episodes, zero edit-test cycles. No code was ever produced or run against the examples.
- **Time allocation**: ~100% reconnaissance/analysis, 0% implementation. The first ~13 episodes (≈1h) were toolchain hunting; the last episodes gathered fixture data. The final two LLM calls hung for ~1384s and ~1337s each (≈23 min apiece) — `trial.log` shows two `litellm.Timeout: Connection timed out. Timeout passed=600.0` retries — consuming the final ~46 minutes with no progress.
- **What worked / failed**: The agent correctly diagnosed that Rust was unavailable and that the grader is purely output-based. **Failure point**: it spent so long perfecting its reference data that it never wrote the implementation, then lost its remaining buffer to LLM API connection stalls.
- **Strategy quality**: Poor time allocation. The agent's diagnosis was sound, and its Python-fallback plan was viable (see below), but spending the entire 2-hour budget on analysis without producing even a skeleton binary is a strategic failure. The instruction explicitly warned: "Get a compiling binary early, then iteratively add features... When you have ~10 minutes left, stop adding new features... copy the binary to `/app/workspace/rls`." The agent ignored this and produced nothing. That said, the agent was operating under a genuinely broken premise (no usable Rust), which heavily shaped its time sink.

## Flags

### rust_toolchain_inaccessible_to_agent — HIGH
**Category**: TASK_FAIRNESS
**Evidence**: The instruction requires Rust ("You must implement this in **Rust**"; "You may use ... `cargo build`") and the verifier's build path keys on `/app/workspace/Cargo.toml` + `cargo build --release`. But the Dockerfile installs the toolchain as **root**:
```
RUN curl ... https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:..."
```
rustup installs cargo/rustc into `/root/.cargo/bin`. The agent runs as the non-root `agent` user (`[agent] user = "agent"`), and `/root` is mode 700 — inaccessible to non-root. The trial confirms this directly (terminus_2.pane):
- `which cargo rustc` → nothing; `cargo --version` → `bash: cargo: command not found` (line 13)
- `find / -name 'cargo' -o -name 'rustc' 2>/dev/null` → **empty output** (lines 43–44): the binaries in `/root/.cargo/bin` are not even visible to the agent user.
- `allow_internet = false` (correct hard rule) + no root means rustup cannot be re-installed.

The Rust toolchain is present in the image but unreachable by the user that is supposed to use it. The intended (Rust) solution path is therefore impossible for any agent.
**Recommendation**: Install Rust system-wide and accessible to the `agent` user — e.g. set `CARGO_HOME=/usr/local/cargo RUSTUP_HOME=/usr/local/rustup`, install rustup there, `chmod -R a+rX`, and put `/usr/local/cargo/bin` on PATH; or install `rustc`/`cargo` via apt before disabling network. Verify with an oracle that actually runs `cargo build`.

### oracle_does_not_exercise_the_build — MEDIUM
**Category**: TASK_FAIRNESS
**Evidence**: `solution/solve.sh` does not build any Rust. It decrypts the pre-built `oracle.enc` (the system `ls`) to `/app/workspace/rls` and plants `/app/workspace/.oracle_solution` to bypass anti-cheat. Because the oracle never invokes `cargo`, the oracle reward ceiling is achievable without a working Rust toolchain — so the toolchain-inaccessibility bug above is completely hidden from oracle validation. A proper oracle would have failed to build and surfaced the defect.
**Recommendation**: Make (or add) a real Rust oracle that compiles a reference crate with `cargo build` as the `agent` user. If the decrypt-shortcut oracle is kept for scoring sanity, add a second oracle that exercises the actual intended build path.

### agent_produced_no_implementation — MEDIUM
**Category**: (context for verdict; agent-side)
**Evidence**: Final artifact workspace contains only the original `examples/` tree — no `rls`, no `Cargo.toml`, no `*.rs`, no Python script (`artifacts/workspace/` listing). `reward.json` reason = `no_binary`, `tests_total: 0`. The verifier would have accepted a non-ELF executable at `/app/workspace/rls` (the existing-binary branch runs `$RLS` directly with no ELF check), so the agent's stated Python fallback was viable — but it was never written. The agent spent the entire budget on reconnaissance and lost the last ~46 min to LLM connection timeouts.
**Recommendation**: N/A (agent behavior). Noted to explain that the 0.0 partly reflects the agent's own poor time management, not solely the environment defect.

## Summary

The agent scored 0.0 with reason `no_binary` because it produced no implementation whatsoever during its 2-hour run. The root cause is a **genuine environment defect**: the task requires a Rust implementation and the verifier is built around `cargo build`, but the Rust toolchain was installed by rustup into `/root/.cargo/bin` while the agent runs as the non-root `agent` user. `/root` (mode 700) is inaccessible to that user, so `cargo`/`rustc` are not found anywhere on the agent's PATH or filesystem (`find / -name cargo` returned empty). With `allow_internet = false` and no root, the agent had no way to obtain a Rust toolchain. The intended Rust solution path is therefore impossible for any agent, which is a TASK_FAIRNESS / resource-adequacy failure. This defect was masked by an oracle that merely decrypts a pre-built `ls` binary and never runs `cargo`, so it was never caught during task validation.

That said, the agent is not blameless. The verifier would have accepted a Python executable at `/app/workspace/rls` (it runs a pre-existing `$RLS` directly with no ELF gate), and the agent itself identified this Python fallback by episode 15 — yet it spent the full budget dumping fixture metadata and the test matrix without writing a single line of implementation, then lost the final ~46 minutes to two ~23-minute LLM API connection stalls (`litellm.Timeout`). A more disciplined agent could plausibly have shipped a partial Python `ls` and scored non-zero.

On balance, the verdict is **UNFAIR**: the task as specified (Rust) is impossible because the toolchain is inaccessible to the agent user, and this contradiction between the instructions/verifier and the actual environment is a real defect rather than mere difficulty. The 0.0 reward does reflect "no binary produced," but the agent was never given a working environment to pursue the required approach. Confidence is moderate (0.7) because a viable non-Rust escape hatch existed and the agent's own time mismanagement also contributed to the empty result — so a reviewer could reasonably weigh this as FAIR (agent failed to ship anything despite an available fallback). The environment/oracle defects should be fixed before re-running this task regardless of verdict.
