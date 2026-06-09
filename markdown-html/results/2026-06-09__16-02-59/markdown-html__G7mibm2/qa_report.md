# QA Report: markdown-html__G7mibm2

## Verdict: FAIR

**Confidence**: 0.97
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2m 0s — exactly the full 7200s (2h) limit (timed out)
**Verifier**: 9.1s
**Agent setup**: 47.6s
**Timed out**: yes

## Agent Strategy

- **Approach**: Incremental, bottom-up hand-coded CommonMark parser in C. The agent appended functions to `md2html.c` chunk-by-chunk via heredocs (`cat >> md2html.c`), compile-checking after each addition with `gcc -c`.
- **Key steps**: (1) Explored workspace, starter `Makefile`, `md2html.c`, and the 458-case test suite. (2) Built core infrastructure: dynamic buffer (`buf_t`), UTF-8 encode, node types, entity decoding (a large `entities.h` was present, 2132 lines). (3) Added block-level line scanners (thematic break, ATX/setext headings, code fences). (4) Added inline scanners (HTML inline, autolinks). (5) Was mid-way through adding link destination/title/label parsers and the reference map when the timer expired.
- **Iterations**: 11 episodes, each a long code-generation step. API request times show several very long generations (706s, 764s, 334s, 292s), consistent with emitting large code blocks. No edit-test thrash loop — the agent progressed linearly through subsystems.
- **Time allocation**: Almost entirely writing C code; minimal time reading/testing. The agent never reached a point where it could run the full test suite because the program had no `main` and was not yet linkable.
- **What worked / failed**: The methodical build compiled cleanly at the object-file level for each piece. The failure point: the agent ran out of time before writing `main()` and wiring the block parser + inline parser + HTML renderer into a working pipeline. At the 7200s cutoff, `md2html.c` was only 331 lines and had **no `main` function**, so linking failed (`undefined reference to 'main'`).
- **Strategy quality**: The bottom-up approach is reasonable for a parser, but the time budgeting was poor for the scope. CommonMark is a very large spec; spending the entire 2 hours emitting helper/scanner functions without ever producing a runnable end-to-end binary meant zero testable output. A better strategy would have been to get a minimal end-to-end pipeline (read stdin → trivial render → write stdout, with `main`) compiling and passing the simplest tests early, then incrementally expand — guaranteeing a non-zero score along the way. As executed, the agent had nothing scorable when the clock ran out.

## Flags

(none)

## Summary

The agent attempted a from-scratch CommonMark Markdown-to-HTML converter in C and hit the 7200-second (2-hour) agent timeout (`AgentTimeoutError`) while still in the middle of building the parser. The captured workspace snapshot confirms the code was incomplete: `md2html.c` is only 331 lines, contains no `main()` function, and ends mid-implementation in the email-autolink scanner. The verifier ran cleanly (9.1s), attempted both `make` and the `gcc` fallback, and both failed with `undefined reference to 'main'`. It correctly classified this as `compilation_failed` and assigned a reward of 0.0 (correctness 0.0, performance 0.0).

This is a legitimate agent-side failure, not an infrastructure failure. Although the trial carries an `AgentTimeoutError` exception, the timeout is a consequence of the agent exhausting its allotted time, and the verifier still executed normally afterward and produced a valid, well-formed `reward.json`. The verifier is properly hardened: it locks and wipes `/logs/verifier` first, re-locks `/tests` to 0700, runs all builds and `md2html` invocations as the non-root `agent` user under `strace`, scores as root outside strace without importing agent code, and includes reward-file and external-converter tripwires. No reward hacking, file tampering, or background-process activity was observed anywhere in the trajectory (`grep` for `reward`/`/logs/verifier`/`/tests` in the agent pane returned zero hits).

The reward of 0.0 accurately reflects the agent's performance: it produced no compilable, runnable converter within the time limit. The task itself is fair — instructions clearly state the 2-hour limit, the from-scratch-C requirement, and the correctness+performance scoring, and the verifier enforces exactly that. Verdict: FAIR.
