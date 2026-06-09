# QA Report: markdown-html__iM3eGmi

## Verdict: FAIR

**Confidence**: 0.96
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s — hit the exact agent.timeout_sec (7200.0)
**Verifier**: 7.6s
**Agent setup**: 44s
**Timed out**: yes (AgentTimeoutError after 7200.0 seconds)

## Agent Strategy

- **Approach**: Big-bang from-scratch C implementation of a CommonMark→HTML converter, building a cmark-style block parser (strbuf, node tree, scanners, HTML-block detection, entity lookup) directly into `md2html.c`.
- **Key steps**:
  1. Wrote core infrastructure: dynamic string buffer (`strbuf`), AST node type/allocator, tree linking helpers.
  2. Implemented block-level scanners (thematic break, ATX/setext headings, code fences, list markers) and an inline HTML-tag scanner.
  3. Built entity binary-search lookup, UTF-8 encoder, HTML escaping, and href escaping.
  4. Started the parser driver (`advance_offset`, `find_first_nonspace`, `finalize`, `add_child`) and HTML-block start/end detection.
  5. At episode 14, recognized the core line-incorporation algorithm was wrong, `head -630`-truncated the file, and planned to "carefully rewrite the core: add_line ... incorporate_line ... open_new_blocks as inline code."
- **Iterations**: 16 episodes. No tight edit→build→test loop is visible; the agent spent the run accumulating a large single-file implementation and was in the middle of a core rewrite when time expired.
- **Time allocation**: Dominated by very long LLM generations — `api_request_times_msec` shows individual calls of ~743s, ~623s, and a final ~1,214s (~20 min). Heavy time spent reasoning/writing large code blocks; comparatively little on verification.
- **What worked / failed**: Failure point is decisive and unambiguous — the final `md2html.c` (630 lines) contains **no `main()` function**, so the build fails at link time (`undefined reference to 'main'`) under both `make` and the `gcc` fallback. Several scanner functions are also defined-but-unused, confirming the parser was never wired together. The agent ran out of its 2-hour budget mid-rewrite before adding the driver and `main`.
- **Strategy quality**: The algorithmic choice (cmark-style two-pass block/inline parser) is appropriate for the problem. However, the execution strategy was poor for a time-boxed task: the agent attempted a monolithic implementation with no incremental compile/test gating, never produced a buildable binary, and consumed enormous wall-clock per LLM turn. A sounder approach would have been to land a minimal compiling `main` + paragraph passthrough early, then iterate against the 458 visible tests. The reward of 0.0 accurately reflects a submission that does not compile.

## Flags

(none)

## Summary

This trial is a clean, correctly-scored failure. The agent (terminus-2 / claude-opus-4-8) attempted a from-scratch CommonMark-to-HTML converter in C, hit the full 7200-second agent timeout (`AgentTimeoutError`), and left an incomplete `md2html.c` with no `main()`. The verifier ran normally in 7.6s, built the code as the `agent` user under strace, and the build failed at link time with `undefined reference to 'main'` (both via `make` and the `gcc` fallback), yielding the non-scoring outcome `compilation_failed` and a reward of 0.0.

The timeout is the agent's own fault, not infrastructure: agent setup completed in 44s without OOM, the environment built in ~9s, and the verifier completed successfully — so the harness was healthy. The agent simply did not finish a compilable program within the generous 2-hour budget, partly due to extremely long per-turn LLM generations (a final ~20-minute call) and a monolithic, non-incremental strategy that never produced a buildable binary.

No fairness or reward-hacking concerns: the task instructions accurately describe the requirement (compile to `/app/workspace/md2html`, read stdin, write HTML), and the verifier enforces exactly that. The verifier is well-hardened — it `chmod 700`s and wipes `/logs/verifier` first, re-locks `/tests` to 0700, sanitizes the environment (`LD_PRELOAD`, `PYTHONPATH`, `CC`, etc.), runs all agent builds/executions as the non-root `agent` user under `strace -f`, and gates scoring through reward-tamper and external-converter tripwires with compute_reward.py running outside strace. No tripwires fired and there is no evidence of any gaming attempt. Verdict: FAIR.
