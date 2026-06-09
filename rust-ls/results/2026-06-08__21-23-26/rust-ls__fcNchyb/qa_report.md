# QA Report: rust-ls__fcNchyb

## Verdict: UNFAIR

**Confidence**: 0.75
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m (hit the hard cap — `AgentTimeoutError`)
**Verifier**: ~2.3s (23:24:32 → 23:24:35)
**Agent setup**: ~34s (23:23:58 → 23:24:32)
**Timed out**: yes (agent execution timed out after 7200.0 seconds)

## Agent Strategy

- **Approach**: Environment reconnaissance first, then planned a from-scratch reimplementation. Never reached the implementation phase.
- **Key steps**:
  1. Episodes 0–3: discovered `cargo`/`rustc` are **not installed** (`bash: cargo: command not found`).
  2. Episodes 3–9: probed for internet to install Rust via rustup — `Could not resolve host: sh.rustup.rs`; `apt` failed with `Permission denied` (non-root).
  3. Episodes 10–19: exhaustive filesystem search (`find / -type f -name rustc/cargo/rustup`, `.cargo`, `rustlib`, `/usr/local/cargo`) — **zero hits anywhere on the agent-visible filesystem**.
  4. Episode 20: correctly concluded Rust is "genuinely unavailable and uninstallable" and pivoted to writing the clone in **C** (gcc-14 present), since scoring is pure output-equality.
  5. Episodes 21–29: mapped the test surface (322 tests, all flags, fixtures, glob/`-I`/`--hide` cases) — but **never wrote a single line of code** before the 2-hour cap.
- **Iterations**: ~20 episodes of pure environment search, then ~9 episodes of test-surface mapping. No edit-test cycles at all — the agent never produced any source or binary.
- **Time allocation**: ~100% reading/exploring, 0% writing/compiling. Two episodes alone consumed ~27 min (episode 25 ≈ 23 min, episode 28 ≈ 4.3 min per `api_request_times_msec`), and the trial.log shows **two 600-second LLM connection timeouts** (`litellm.Timeout … 600.0s`) = ~20 min lost to infrastructure.
- **What worked / failed**: The diagnosis was correct and the C pivot was the right call given the broken environment. The failure was time management: it kept exploring instead of getting a minimal binary on disk early, and a large fraction of the budget was consumed by LLM timeouts and one ~23-minute call.
- **Strategy quality**: Mixed. The ~20 episodes hunting for Rust were a *rational* response to an instruction that explicitly demands Rust — the agent was not being careless, it was trying to comply with the stated constraint. But after deciding on C at episode 20 it should have immediately written and compiled a minimal `rls` (even a stub that handles `-1`/`-a`) to bank non-zero score, per the instruction's own "get a compiling binary early" advice. It instead spent another 9 episodes mapping tests and timed out with nothing on disk.

## Flags

### environment_rust_toolchain_inaccessible — HIGH
**Category**: TASK_FAIRNESS
**Evidence**:
- `instruction.md:177` "You must implement this in **Rust**"; `:178` forbids `uutils`/any ready-made `ls` crate.
- Runtime (this trial, `agent` user): `terminus_2.pane:8-9` → `bash: cargo: command not found` / `bash: rustc: command not found`. Multiple full-filesystem searches returned nothing: `find / -type f \( -name 'rustc' -o -name 'cargo' -o -name 'rustup' \)` (episode-11 prompt) → empty; `find / -type d -name '.cargo'` (episode-14 prompt) → empty.
- No recovery path: `Could not resolve host: sh.rustup.rs` (pane:36–38, `allow_internet=false`); `apt-get install rustc cargo` → `Could not open lock file … Permission denied` (pane:40,97).
- Root cause in `environment/Dockerfile`: `RUN curl … sh.rustup.rs | sh -s -- -y` installs rustup **into root's home** (`/root/.cargo/bin`, root-owned mode 700), and `ENV PATH="/root/.cargo/bin:…"`. But `task.toml:10` sets `[agent] user = "agent"`. The non-root agent cannot traverse `/root`, so the required toolchain is invisible/unusable to it.
- Confirmed regression: sibling agent trial `2026-06-08__20-45-36/rust-ls__7qHpzGD` (run *before* the 21:13 task.toml/Dockerfile edits) **did** build a Rust binary (`ls_build/target/release/rls` present in its artifacts). The current trial cannot — consistent with the user-separation change cutting off `/root/.cargo`.
**Recommendation**: Install the Rust toolchain system-wide and agent-accessible. Either set `CARGO_HOME=/usr/local/cargo RUSTUP_HOME=/usr/local/rustup` before the rustup install and `chmod -R a+rX` (and put `/usr/local/cargo/bin` on PATH), or run the rustup install as the `agent` user. Then add an oracle/pre-QA check that **builds an actual Rust project as the `agent` user** (the current oracle only decrypts GNU `ls`, so it never exercises the Rust path and masked this break).

### instruction_verifier_mismatch (Rust required but unenforced; non-Rust silently allowed) — MEDIUM
**Category**: TASK_FAIRNESS
**Evidence**: `instruction.md:177-178` mandate Rust and forbid ready-made crates, but `tests/test.sh` accepts **any ELF** at `/app/workspace/rls` (`:201-205`, `:163-180`) and only the optional fallback build is Rust-specific (`:167-178`). The anti-cheat only greps `Cargo.toml` for `uutils|coreutils` (`:246-251`) — a C implementation faces no language check at all. So the instruction's central constraint ("must be Rust") is not verified, while the environment makes Rust impossible. The agent burned ~20 episodes trying to honor a constraint the verifier does not enforce and the environment does not support.
**Recommendation**: Make the environment and verifier agree with the instruction. If Rust is truly required, fix the toolchain access (above) and have the verifier require a buildable Cargo project; if any-language output-equality is acceptable, soften the instruction's "must implement in Rust" wording so the agent isn't misled.

### llm_connection_timeouts — LOW
**Category**: INFRASTRUCTURE_FAILURE
**Evidence**: `trial.log` records two `Unknown Error in LLM interaction: litellm.Timeout: AnthropicException … Timeout passed=600.0, time taken=600.0s` events. `result.json` `api_request_times_msec` shows entries of `1390883ms` (~23 min) and `256315ms` (~4.3 min). Roughly 20+ minutes of the agent's 120-minute budget was consumed by LLM-side stalls rather than work.
**Recommendation**: Note as a contributing factor. Not the primary cause (the agent had not written code even before the late-trial timeouts), but it meaningfully reduced effective working time on an already-handicapped run.

## Summary

The agent scored 0.0 with reason `no_binary`: the collected `/app/workspace` artifact contains only the original `examples/` directory — no Cargo project, no source, no `rls` binary. The verifier itself is well-hardened and behaved correctly (locks/wipes `/logs/verifier`, runs agent code under `strace -f`, accepts any ELF, scores by output diff). Mechanically, "no binary → 0.0" is accurate.

However, the outcome does not faithfully reflect agent capability because the environment contradicts the task. The instruction explicitly requires Rust and forbids ready-made `ls` crates, but in this trial the Rust toolchain is **completely inaccessible to the non-root `agent` user**: `cargo`/`rustc` are not on PATH, full-filesystem searches find no `rustc`/`cargo`/`.cargo` anywhere, there is no internet to reinstall (`allow_internet=false`), and `apt` is denied (non-root). The root cause is in the Dockerfile: rustup installs into root-owned `/root/.cargo`, which the `agent` user cannot reach — a regression introduced when `[agent] user = "agent"` was added (a sibling trial run before that edit successfully built Rust). The oracle never caught this because it only decrypts GNU `ls` rather than compiling Rust. The agent diagnosed the problem correctly and rationally pivoted toward C (which the verifier would in fact accept, since "must be Rust" is not enforced), but spent too long exploring and lost ~20 minutes to LLM connection timeouts, timing out before writing any code.

Verdict: **UNFAIR**. The driving issue is a task-fairness/environment defect (a hard-required toolchain made unavailable, contradicting the instruction and unrecoverable under the task's own no-internet/non-root constraints), compounded by an instruction↔verifier mismatch and LLM-infra timeouts. Confidence is held at 0.75 rather than higher because gcc/C was available and the verifier accepts any ELF, so a faster agent could have salvaged partial score — i.e., the agent's own slow time-allocation also contributed to the zero. The task should not be re-scored as-is until the Rust toolchain is made accessible to the `agent` user and validated by an oracle that actually compiles Rust.
