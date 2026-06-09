# QA Report: markdown-html__dKuiSeT

## Verdict: FAIR

**Confidence**: 0.97
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s (hit the hard limit exactly)
**Verifier**: 0.48s
**Agent setup**: 46s
**Timed out**: yes (AgentTimeoutError after 7200.0 seconds)

## Agent Strategy

- **Approach**: Big-bang, from-scratch implementation of a full CommonMark parser in C, written incrementally by appending code "chunks" to `md2html.c` via heredoc (`cat >> md2html.c`).
- **Key steps**:
  1. Read the spec and probed the visible test suite (e.g. grepped for `&quot;` to settle escaping behavior).
  2. Wrote the dynamic buffer layer (`buf_init`/`buf_putc`/`buf_puts`).
  3. Wrote node-tree data structures (`Node`, `node_new`, `node_append_child`, `node_unlink`, ...) and a `RefMap` for link reference definitions.
  4. Wrote utility helpers: `utf8_encode`, `escape_html`, `escape_href`, `entity_lookup` (binary search over a generated entity table).
  5. Ran out of time before writing the block parser, inline parser, or `main()`.
- **Iterations**: 8 episodes, no edit-test loop ever completed because the program was never compilable. API request times climbed steeply (5s → 198s → 913s → 1521s), i.e. the model was emitting ever-larger code blocks and stalled inside a single ~25-minute generation when the 2-hour wall hit.
- **Time allocation**: A small amount of reading/probing up front, then almost entirely code generation. Essentially zero testing, because nothing compiled yet.
- **What worked / failed**: Failure point is structural — the agent attempted the entire CommonMark spec (one of the hardest text-parsing specs) as a monolithic write-it-all-then-compile effort. It never produced a `main()`, so the binary never linked. The final `md2html.c` snapshot is only 122 lines of scaffolding/helpers.
- **Strategy quality**: Poor for the time budget. A from-scratch CommonMark implementation is very large; a sound strategy would have stood up a minimal `main()` + trivial paragraph passthrough early to get a compiling, partially-scoring binary, then iterated to grow coverage (the scoring is fractional: 50% correctness rate + 50% performance). Instead the agent front-loaded library plumbing with no runnable entry point and got zero compile checkpoints. It did not get stuck repeating a failing approach — it simply never reached a checkpoint before timing out.

## Flags

### slow/incomplete-implementation-timeout — INFORMATIONAL (no defect)
**Category**: (none — documenting why the timeout is the agent's fault, not infrastructure)
**Evidence**: `result.json` `exception_info.exception_type = "AgentTimeoutError"`, `agent_execution` spanned exactly 7200.001s. The verifier subsequently ran and completed normally in 0.48s (`verifier` 23:22:10.30 → 23:22:10.78), producing `status.txt = compilation_failed`. `gcc.log`/`make.log` show `undefined reference to 'main'` — the workspace snapshot `md2html.c` is 122 lines of helpers with no `main()` and no parser. This is an agent-side failure (incomplete code), not a harness failure; the sandbox did NOT expire and verification ran cleanly.
**Recommendation**: None. Score 0.0 correctly reflects a non-compiling, incomplete submission.

## Summary

This trial is a clean, correctly-scored failure. The agent (terminus-2 / claude-opus-4-8) attempted to write an entire CommonMark Markdown-to-HTML converter in C from scratch, building it up chunk by chunk. It implemented the buffer layer, node-tree structures, a reference map, and several utility helpers, but never wrote the block/inline parser or a `main()` function before exhausting the full 2-hour agent budget. As a result the program failed to link (`undefined reference to 'main'`), the verifier recorded `compilation_failed`, and the reward is 0.0.

The reward accurately reflects the agent's performance: nothing scorable was produced. The timeout is a consequence of the agent's monolithic "write everything, then compile" strategy applied to an extremely large spec — a legitimate agent-side failure, not an infrastructure problem. Crucially, the verifier executed normally after the timeout (0.48s) and was not torn down, so this is not an INFRASTRUCTURE_FAILURE.

The verifier itself is well-hardened and behaved correctly: `task.toml` sets `user = "agent"`; `test.sh` locks (`chmod 700`) and wipes `/logs/verifier` before doing anything; agent code (its Makefile/binary) is executed under `strace -f`; the strace log is scanned for reward-file write opens before any scoring; and `compute_reward.py`-equivalent scoring runs outside strace reading only evidence files. `cheat_detected.txt = 0` and no reward-file manipulation was found — appropriate, since the agent never attempted to game the verifier. No false positive, false negative, or fairness issue is present.
