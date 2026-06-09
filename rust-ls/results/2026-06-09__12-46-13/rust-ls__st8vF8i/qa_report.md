# QA Report: rust-ls__st8vF8i

## Verdict: FAIR

**Confidence**: 0.92
**Reward**: null (verifier never ran; effective score 0.0 — no deliverable produced)

## Timing

**Agent execution**: 7200s / 2h 0m 0s (hit the hard limit exactly — 12:47:00 → 14:47:00)
**Verifier**: ~0.13s (12:47:00.402 → 14:47:00.528) — started but produced no result (`verifier_result: null`)
**Agent setup**: ~40s (12:46:20 → 12:47:00)
**Timed out**: yes (AgentTimeoutError after 7200.0s)

## Agent Strategy

- **Approach**: Exploration-first ("explore everything, then write the whole implementation in one shot"). The agent intended incremental tier-by-tier development but never reached the implementation phase.
- **Key steps**:
  1. Episodes 0-9: Probed the environment (`cargo`/`rustc` available 1.96.0, `ls` disabled), enumerated fixtures, examples, and tier test definitions.
  2. Episode 10: Ran `cargo new --bin rls_proj` (created an empty project, edition 2024).
  3. Episode 11: Tried `cargo add libc` — failed (no internet), correctly concluding it must hand-roll libc FFI bindings.
  4. Episodes 12-21: Continued analyzing test combos (`-lI`, `-lG`, `-lL`), block/total computation, fixture ownership, timestamps, special-name byte content. Each episode ended with "now I'll write the full Rust implementation."
  5. Episode 22: Timed out during the LLM call before any code was written.
- **Iterations**: Zero edit-test cycles. No `main.rs` was ever written, no `cargo build` of real logic was ever run. The only build artifact is an empty `cargo new` skeleton.
- **Time allocation**: ~100% exploration/analysis, 0% implementation. The instruction explicitly warned: "Get a compiling binary early… When you have ~10 minutes left, stop adding new features — do a final `cargo build --release`." The agent did the opposite.
- **What worked / failed**: Domain understanding was accurate (block totals, oracle-on-same-FS reasoning, FFI necessity). The fatal failure was paralysis-by-analysis: it spent the entire 2-hour budget gathering context and never started coding. This was compounded by extremely slow LLM API calls late in the run — `api_request_times_msec` shows the final calls at 1.38M, 1.54M, 1.33M, and 1.38M ms (~22-26 min each), and `trial.log` records a `litellm.Timeout` at 600s. These slow/retried calls burned wall-clock time, but the root cause is strategic: no implementation existed even by episode 21.
- **Strategy quality**: Poor. The agent chose a high-risk "analyze fully, then write everything" strategy on a `very_hard` task with an explicit instruction to ship a compiling binary early and iterate. It never adapted despite 21 episodes elapsing, repeatedly deferring implementation. An appropriate strategy (stub a tier-1 `-1`/`-a` binary first, then expand) would have produced a non-zero deliverable.

## Flags

### sandbox_teardown_after_agent_timeout — SEVERITY: LOW
**Category**: INFRASTRUCTURE_FAILURE
**Evidence**: `trial.log` lines 26-31: "Failed to download logs to .../agent", "Failed to upload agent logs back to environment", "Trial rust-ls__st8vF8i failed: Failed to add tests directory to environment.", "Failed to download artifact '/app/workspace'", "Error terminating Modal sandbox:". `result.json` shows `verifier_result: null` and the verifier window is only ~0.13s. The artifacts manifest shows both `/logs/artifacts` and `/app/workspace` downloads with `"status": "failed"`.
**Recommendation**: This is the documented consequence of the agent consuming its full `timeout_sec` (7200s) — the Modal sandbox was being torn down before `tests/` could be uploaded and the verifier could run. Per the QA guide this is NOT independent infrastructure failure; it is a side-effect of the agent timing out, so the verdict remains FAIR. No task change required. The sibling trial in the same job (`rust-ls__RemZjGE`) timed out identically, confirming the harness is healthy and the failure is agent-specific (timeout), not a broken harness.

## Summary

The agent timed out after the full 2-hour budget (`AgentTimeoutError after 7200.0 seconds`) while in the middle of an LLM API call, having written **zero lines** of the actual Rust `ls` implementation. Across all 23 episodes it remained in the exploration/analysis phase — enumerating fixtures, test definitions, and flag combinations — and only ever produced an empty `cargo new` skeleton. There is no `rls` binary at `/app/workspace/rls`, so the correct outcome is a score of 0.0 (the unmodified baseline). The verifier never produced a reward because the Modal sandbox was already being torn down after the agent timeout ("Failed to add tests directory to environment"), which is the documented and expected side-effect of an agent exhausting its timeout — not an independent infrastructure failure.

This outcome accurately reflects the agent's performance: it failed to deliver anything evaluable, so a null/zero reward is correct. The slowness of the final LLM calls (multiple ~22-26 minute requests, one hitting the 600s litellm timeout) contributed to the wall-clock exhaustion, but the decisive factor was the agent's strategic failure to begin implementation despite explicit instructions to ship a compiling binary early and iterate. The verifier itself is well-hardened (locks/wipes `/logs/verifier` first, runs the agent build under `strace -f` as the non-root `agent` user with `env -i`, enforces build-from-source, and applies static anti-cheat and an oracle-decrypt guard); none of these were exercised here because verification never ran. The verdict is FAIR with high confidence: the trial did not produce an inflated or unjustly low score — it produced no meaningful deliverable, and the agent's own timeout is responsible.
