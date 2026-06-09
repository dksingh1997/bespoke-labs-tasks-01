# QA Report: elf-linker-from-scratch__LMhaJvu

## Verdict: FAIR

**Confidence**: 0.97
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m (hit hard cap — `AgentTimeoutError`)
**Verifier**: ~9s (14:46:27 → 14:46:36)
**Agent setup**: ~45s (12:45:31 → 12:46:16)
**Timed out**: yes

## Agent Strategy

- **Approach**: Pure research/exploration. The agent treated the task as an open-ended investigation of ELF/musl internals and never transitioned into implementation.
- **Key steps**:
  1. Episode 0: explored `/app`, `Makefile`, `tests/` (sound start).
  2. Inspected `.o`/`.a` files with `readelf -r/-s/-S`, `objdump`, `od`, `ar t`.
  3. Extracted and analyzed musl's `libc.a`, `crt1.o`, `crti.o`, `crtn.o`.
  4. Episode 20–21: deep-dived into `__libc_start_main`, `_DYNAMIC`, `__init_array_start/end`, GOT relocations, GNU property notes.
  5. Episode 22 (final): timed out while still scanning libc objects for init/fini arrays.
- **Iterations**: 23 episodes, **zero** edit-test cycles. No `make` of a real implementation, no write to `myld.c` ever occurred.
- **Time allocation**: ~100% research/exploration, 0% implementation. Several individual LLM calls were extremely long (205s, 200s, 187s, 145s, 102s per `api_request_times_msec`), consuming a large share of the budget on analysis.
- **What worked / failed**: The research was technically competent (correctly identified the hard parts of musl linking). The fatal failure: the agent never wrote a single line of linker code. The artifact `myld.c` is the untouched 8-line stub that just prints `"myld: not yet implemented\n"` and returns 1.
- **Strategy quality**: Poor time allocation. For a "hard" task with a 2-hour budget, spending the entire budget on research without ever attempting even a minimal `t1_exit`-passing implementation is a strategic failure. The agent should have built incrementally (e.g., get the simplest single-`.o` exit test linking first, then expand). It got stuck in an unbounded research loop and ran out of time.

## Flags

(none — the outcome is correct and the verifier is sound)

## Summary

The agent ran for the full 7200-second budget and was killed by `AgentTimeoutError` mid–LLM-query. Inspection of the trajectory (terminus pane + episode responses) shows it spent the entire session researching ELF object/archive internals and musl libc startup machinery, and **never wrote any linker implementation**. The collected artifact `myld.c` is the original 8-line stub. The verifier built that stub successfully (`gcc ... -o myld myld.c`), but the resulting `myld` only prints "not yet implemented" and exits 1, so every link/run failed and all 14 tests across tiers t1–t5 legitimately failed → reward 0.0.

The reward accurately reflects performance: the agent produced no working solution. This is a legitimate timeout caused by the agent's own poor time allocation (over-researching, under-implementing), not an infrastructure failure — environment build (6s), agent setup (45s), and the verifier (9s) all completed normally.

The verifier itself is well-hardened and behaved correctly: it locks+wipes `/logs/verifier` first, sets `/tests` to 700, sanitizes the environment, runs all agent code (build + per-tier link/run) as the non-root `agent` user under `strace -f`, checks for reward-file `openat` writes (`REWARD_TAMPER=0` — no tampering), and writes the scoreboard only in a root-only phase with no agent code in the loop. The anti-gaming "too short: 8 non-blank lines (need 150)" note is moot here since `pre_gate_total` was already 0.0 (0/14 tests passed); the gate did not suppress any earned score. No false negative, no false positive, no reward hacking.
