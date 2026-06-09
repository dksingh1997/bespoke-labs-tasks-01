# QA Report: elf-linker-from-scratch__DKvXQXn

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s (hit the hard timeout)
**Verifier**: ~11s (14:46:22 → 14:46:33)
**Agent setup**: ~45s (12:45:31 → 12:46:16)
**Timed out**: yes (AgentTimeoutError after 7200.0 seconds)

## Agent Strategy

- **Approach**: Research-heavy, "analyze-then-implement" plan that never reached the implementation phase. The agent exhaustively reverse-engineered the ELF/relocation/musl-CRT model but never wrote the linker.
- **Key steps**:
  - Inspected `.o`/`.a` files with `readelf -r/-s/-S` and `objdump` across all tiers.
  - Built reference binaries with `gcc -static -nostdlib` / `musl-gcc` to learn expected exit codes and output.
  - Enumerated the relocation types in `libc.a` (R_X86_64_64, PC32, PLT32, REX_GOTPCRELX), figured out `_init`/`_fini` concatenation from crti/crtn, and the set of required linker-defined symbols.
  - Ran `find / ... grep -iE 'test|grade|run|check'` (episode 13) trying to locate the grading harness — found nothing usable because `/tests` is mode-700 (root-only).
- **Iterations**: 15 episodes, essentially all in the research/planning phase. Multiple episodes ended with "Then I'll start writing myld.c" but the code was never written.
- **Time allocation**: ~100% reading/investigating, ~0% writing/testing the linker. The final `myld.c` artifact is the original 9-line stub (`fprintf(stderr, "myld: not yet implemented\n"); return 1;`). One LLM call took ~1,534s (~25 min) and several others 90–243s (reasoning_effort=max), burning the clock.
- **What worked / failed**: Investigation was thorough and largely correct, but the agent grossly mis-allocated time — it never transitioned from analysis to implementation and hit the 2-hour wall with a stub. Classic "90% analysis, 0% implementation" failure.
- **Strategy quality**: Poor time management for a hard, code-heavy task. The agent should have written and iteratively tested a minimal linker for the simplest tier (t1: single `.o`, inline syscall) early, then expanded. Instead it front-loaded research and never produced code. The reward of 0.0 accurately reflects this.

## Flags

(none)

## Summary

The agent was given a hard systems-programming task (write a from-scratch x86-64 static linker in C) and timed out after the full 7200s (2h) without ever writing a real implementation. The artifact `myld.c` is the unmodified 9-line stub. The verifier ran successfully after the timeout (built the stub — which compiles fine — linked/ran all tiers, and graded as root), recording 0/14 tests passed and a final reward of 0.0. The anti-gaming gate additionally flagged the source as "too short: 8 non-blank lines (need 150)", though this was moot since every test already failed.

The reward correctly reflects performance: the agent produced no functional linker, so 0.0 is the right score. This is not an infrastructure failure — the AgentTimeoutError is a consequence of the agent exhausting its own time budget on research, not a harness defect, and the verifier completed normally (verifier duration ~11s, well within the 600s limit). The task is well-constructed and the verifier is strongly hardened: it runs as the `agent` uid under `strace -f` during the agent phase, locks `/logs/verifier` (chmod 700 then wipe) first, locks `/tests` (700), sanitizes the environment, kills surviving agent processes, scores in a root-only phase that runs no agent code, and checks for reward-file tampering. The agent's attempt to locate grading scripts via `find` was correctly thwarted by the `/tests` lockdown. No reward hacking, no false positive, no false negative — verdict FAIR.
