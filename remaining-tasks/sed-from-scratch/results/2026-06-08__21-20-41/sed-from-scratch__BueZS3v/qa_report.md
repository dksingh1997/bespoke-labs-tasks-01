# QA Report: sed-from-scratch__BueZS3v

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s (hit the hard cap — AgentTimeoutError)
**Verifier**: ~2.4s (23:21:32 → 23:21:34)
**Agent setup**: ~41s (21:20:51 → 21:21:32)
**Timed out**: yes

## Agent Strategy

- **Approach**: Exhaustive "research-first" investigation of GNU sed semantics — the agent spent its entire budget probing `/usr/bin/sed` edge cases to build a mental model before writing any implementation code.
- **Key steps**:
  1. Read `Makefile`, `mysed.c` (the stub), and `sed_reference.txt`.
  2. Ran dozens of `/usr/bin/sed ... | od -c` experiments (N/n at EOF, append queue vs `d`/`D`/`c`, P semantics, range addresses, empty-regex recall, in-place multi-file numbering, etc.).
  3. Compiled small C probes (`/tmp/retest.c`, `/tmp/se.c`) to confirm POSIX `regex.h` behavior (`\+`, `\?`, `[[:digit:]]`, `REG_STARTEND`).
  4. At the last completed episode (18), still stating "Then I'll begin writing the implementation" — never started writing `mysed.c`.
- **Iterations**: ~19 episodes, all in the research/experimentation phase. Zero edit-test cycles on the actual implementation. The agent never modified `mysed.c` from its original 228-byte stub.
- **Time allocation**: ~100% reading/experimenting, 0% implementing. Note: API latency was severe — `api_request_times_msec` shows individual LLM calls of 773s, 645s, 626s, and 1343s (22 min), and `trial.log` records a terminal `litellm.Timeout: ... time taken=600.013 seconds`. A large fraction of wall-clock was consumed waiting on slow/timing-out model responses, but even discounting that, the agent had completed no implementation.
- **What worked / failed**: The research was thorough and correct, but the agent fell into classic analysis paralysis. It exhausted the full 2-hour cap with no implementation written. The verifier compiled the unchanged stub (which only does `fprintf(stderr, "mysed: not yet implemented\n"); return 1;`), so all 126 tests failed.
- **Strategy quality**: Poor time allocation. For a "hard" from-scratch C implementation with a 2-hour budget, spending the entire window on edge-case discovery without ever beginning to code is a strategic failure. A reasonable approach would have time-boxed research and started an incremental implementation early. The slow API responses worsened the outcome but were not the root cause — the agent's own plan front-loaded unbounded investigation.

## Flags

(No fairness, false-negative, false-positive, or reward-hacking issues found. The reward of 0.0 accurately reflects that the agent produced no implementation and timed out.)

## Summary

This trial is a legitimate timeout failure. The agent (`terminus-2` / `claude-opus-4-8`) hit the hard 7200-second agent cap (`AgentTimeoutError`) having never written a real `mysed.c`. The artifact collected (`/app/mysed.c`) is byte-for-byte the original stub that prints "not yet implemented" and returns 1. The verifier ran correctly and quickly (~2.4s): it compiled the stub (empty `compile.log` = clean compile of trivial code), ran all 126 GNU/edge-case tests, and every one failed. Reward 0.0 is accurate.

The verifier itself is well-hardened and trustworthy: the agent runs as a non-root `agent` user, `/tests` is `chmod 700` in the Dockerfile, `test.sh` locks (`chmod 700`) and wipes `/logs/verifier` as its first action, executes agent code (`make` + ~150 `mysed` invocations) under `strace -f`, scans the strace log for write-mode opens of `reward.{txt,json}`, and computes the reward outside strace via `compute_reward.py`. No reward-file manipulation was possible or attempted; the stub is benign and the strace gate found nothing.

Per the calibration guidance, an agent that times out and scores 0 is FAIR — the reward correctly reflects performance. The contributing factor of unusually slow/timed-out API responses is an LLM-serving latency issue, not a Harbor infrastructure failure: the environment built fine, agent setup succeeded, and the verifier completed normally. The root cause of the zero score is the agent's own strategy of unbounded up-front research with no implementation. Verdict: FAIR.
