# QA Report: ts-type-checker__M53Pt8j

## Verdict: FAIR

**Confidence**: 0.95
**Reward**: 0.121228

## Timing

**Agent execution**: ~90m 4s (12:47:14 → 14:17:18)
**Verifier**: ~13s (14:18:07 → 14:18:19)
**Agent setup**: ~28s (terminus-2, no install needed under allow_internet=false)
**Timed out**: no (used ~90 min of the 120 min budget; agent self-terminated with task_complete)

## Agent Strategy

- **Approach**: Incremental extension of the provided starter checker. The agent analyzed the test corpus empirically (error-code frequencies, clean-vs-error file counts), then added one error-code detector at a time, re-validating against the full ~1,600-file sample suite after every change with a strict eye on precision.
- **Key steps**:
  1. Surveyed `/app/tests/` and computed error-code frequencies (TS2454, TS2322, TS2362/2363, TS2564, TS2345, TS2339, etc.).
  2. Split the implementation into `tscheck` + a `types.js` module (a real assignability/type engine: unions, literals, boxed types, arrays).
  3. Implemented ~13 error codes with tsc-consistent messages (TS2322, TS2304, TS2339, TS2345, TS2554, and more).
  4. Continuously diffed checker output against `.errors` files, prioritizing zero false positives on clean files.
- **Iterations**: 248 episodes of tight edit-validate cycles. No evidence of being stuck in a loop — each iteration added or refined a distinct check while monitoring the sample pass rate (rose from ~23% starter to ~46.5% on the sample set).
- **Time allocation**: Roughly balanced — early reading/analysis, then a long stretch of implement-and-validate, ending with confirmation that both files were syntactically valid.
- **What worked / failed**: Worked — precision discipline yielded 575/579 (99.3%) clean files correct, clearing the multiplicative scoring's precision penalty and the 100% canary gate. Limited — error-detection recall stayed low (99/811 = 12.2% of error files matched fully), because full per-file matching requires exact line + code + message-substring with no extras, and many TS error categories (classes, expressions, complex generics) were only partially implemented.
- **Strategy quality**: Sound and well-calibrated. The agent correctly identified that precision is critical under `id_rate * non_id_rate` scoring and a 100% canary gate, and deliberately declined to implement high-false-positive-risk codes (TS2430/TS2741/TS2367) that would have jeopardized the clean-file rate. Choosing breadth + precision over speculative depth was the right call for this verifier; the modest reward reflects the genuine difficulty of matching tsc exactly, not a strategic error.

## Flags

(none)

## Summary

The agent attempted a genuinely very-hard task — building a TypeScript type checker from scratch — and produced a real, modular implementation (`/app/checker/tscheck` + `types.js`) that performs actual AST-based type analysis. The verifier ran cleanly: the 100% canary gate passed (7/7), and hidden scoring computed `id_rate (0.9931) * non_id_rate (0.1221) = 0.1212`, matching the recorded reward of 0.121228 exactly.

Anti-cheat was thorough and uneventful. The strace log shows no reward-file writes (`O_WRONLY/O_RDWR/O_CREAT` on reward.{txt,json}: 0 hits) and no invocation of the real tsc/tsserver/typescript binary (the tripwire pattern matched 0 times; the loose "tsc" hits were merely the agent's own "tscheck" name and the `node_modules` NODE_PATH substring). The static grep found no references to test infrastructure or reward paths in `/app/checker/`. The agent ran as the non-root `agent` user under `env -i` with `/tests` re-locked to 0700, so it could not read the hidden answer key, and the checker's output (2,328 diagnostic lines on perturbed hidden inputs) is consistent with a real checker rather than corpus lookup. No hardcoded test filenames or expected-value leakage appears in the trajectory.

The reward accurately reflects the agent's performance: high precision on clean code, low recall on the diverse error corpus, multiplied together as the task design intends. The multiplicative scoring and binary per-file matching are deliberate, instruction-consistent design choices (the instruction explicitly warns about false positives in both directions and message faithfulness). No infrastructure failure, no instruction/verifier mismatch, and no false-negative discarding of intended signal. Verdict: FAIR.
