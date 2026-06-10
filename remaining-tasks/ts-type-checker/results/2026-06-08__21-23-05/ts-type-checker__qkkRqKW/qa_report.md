# QA Report: ts-type-checker__qkkRqKW

## Verdict: UNFAIR

**Confidence**: 0.9
**Reward**: 0.0

## Timing

**Agent execution**: 6149s / 102m 29s
**Verifier**: 0.31s
**Agent setup**: 16.7s
**Timed out**: no (limit 7200s; agent finished naturally at episode 248 with `task_complete: true`)

## Agent Strategy

- **Approach**: Incremental extension of the provided starter checker. The agent kept the existing `@babel/parser`-based TS2304 detector and bolted on additional checks one category at a time, validating each against the `.errors` files in `/app/tests/`.
- **Key steps**:
  1. Wrote a scoring/eval helper (`/app/checker/eval.js`, episode-10) that runs the checker over `/app/tests/` and diffs against `.errors` to compute a pass count.
  2. Added checks for TS2322 (assignment/return/var-init), TS2339 (property access), TS2345/TS2554 (call argument type/count), TS2454, TS2564, TS2362/2363/2365, TS18050, TS2300, plus a parse-error fallback.
  3. Repeatedly snapshotted the checker (`tscheck.bak`, `tscheck.good`, `tscheck.orig`, `tscheck.bak725/727/730`) and spliced in new functions via `/tmp/splice_*.js` patch scripts.
  4. Drove false-positive rates down per category (reported TS2322 FP=0, arithmetic FP=0, TS18050 FP=0, TS2304 FP=2).
- **Iterations**: ~249 episodes of edit-validate cycles. Productive, not a stuck loop — the visible score climbed from a 397 baseline to a reported 785/1547 (50.7%).
- **Time allocation**: Roughly balanced between reading test cases, writing checker logic, and running the eval harness. Heavy validation discipline throughout.
- **What worked / failed**: The checker itself appears genuinely functional. The failure is NOT in the agent's algorithm — it is an anti-cheat false positive triggered by a benign helper file (see Flags). The agent's own final verification (episode 246-248) reported SYNTAX=OK, all four canary error codes detected, and a 785 visible score.
- **Strategy quality**: Sound. The agent chose an appropriate incremental approach for a breadth-oriented task, used the provided parser library, validated continuously against the sample data, and kept false positives low. The only strategic misstep — with hindsight — was leaving non-checker helper files (`eval.js`, multiple `.bak` copies of the checker) inside `/app/checker/`, which is the directory the verifier statically scans for forbidden patterns.

## Flags

### anti_cheat_false_positive (tsc substring match) — SEVERITY: HIGH
**Category**: FALSE_NEGATIVE
**Evidence**:
- `verifier/reward.json`: `"error": "cheat_detected"`, detail mentions "tsc usage".
- `verifier/verifier.log`: `CHEAT DETECTED: Checker shells out to tsc` → `RESULT: Cheating detected — awarding 0.` The verifier bailed at the static grep stage (0.31s) and never executed the checker.
- The triggering anti-cheat in `tests/test.sh` is check 1a:
  `grep -rqE --exclude-dir=node_modules "(child_process|execSync|spawnSync|exec\(|spawn\().*tsc" /app/checker/`
- In episode-10 the agent wrote `/app/checker/eval.js` (a scoring helper) containing:
  `try { out = execSync('/app/checker/tscheck ' + dir, {maxBuffer: 1<<28}).toString(); } ...`
- I verified this exact line matches the anti-cheat regex: the helper invokes the agent's **own** checker, whose name `tscheck` contains the substring `tsc`, so `execSync(...).*tsc` fires. The agent never invoked the real TypeScript compiler — a word-boundary search for the `tsc` binary (excluding `tscheck`) across all 249 episode responses returned nothing.
- `eval.js` was never deleted (the two apparent `rm eval.js` grep hits in episodes 110/121 are false matches inside the words "format"/"intermittently"), so it persisted into `/app/checker/` at verification time.
- The starter checker and `environment/` contain no such pattern, confirming the match originates solely from the agent's helper file.
**Recommendation**: Make the anti-cheat regex require a word boundary / not match the checker's own name. E.g. match `\btsc\b` (the binary) rather than the substring `tsc`, or exclude the literal path `tscheck`. Alternatively, scope check 1a to only the deliverable executable `/app/checker/tscheck` rather than recursively scanning the whole `/app/checker/` directory (which the agent legitimately uses for helper/backup files).

### overbroad_anticheat_scope — SEVERITY: MEDIUM
**Category**: VERIFIER_QUALITY
**Evidence**: All four anti-cheat greps in `test.sh` run recursively over `/app/checker/` (`grep -rqE ... /app/checker/`). The instruction only mandates that the *deliverable* `/app/checker/tscheck` avoid forbidden techniques; it never tells the agent that auxiliary files in that directory will be scanned. The agent reasonably placed `eval.js` and multiple `tscheck.bak*`/`.good`/`.orig` snapshots there. Any of these containing the strings `reward.json`, `hidden_cases`, etc. would also have falsely tripped checks 1c/1d.
**Recommendation**: Restrict the static anti-cheat scan to the actual checker entry point (and its `require`d sources), or document in the instruction that `/app/checker/` is reserved for the deliverable. Use tighter regexes anchored on real compiler invocation (e.g. `tsc(\.js)?['"\s]` after an `exec`/`spawn`), not bare substrings.

## Summary

The trial scored 0.0 due to a verifier anti-cheat **false positive**, not due to any failing on the agent's part. The agent built a genuine TypeScript type checker by extending the provided starter, scoring a reported 785/1547 (~50.7%) on the visible sample tests and detecting all four canary-critical error categories (TS2322, TS2554, TS2304, TS2339). It never shelled out to the real `tsc` compiler or imported the `typescript` package.

The 0.0 was produced because the agent left a benign scoring helper, `/app/checker/eval.js`, in the deliverable directory. That helper runs the agent's own checker via `execSync('/app/checker/tscheck ' + dir)`. The anti-cheat in `test.sh` greps `/app/checker/` recursively for `(execSync|...).*tsc`, and the checker's own name `tscheck` contains the substring `tsc`, so the regex matched the helper's self-invocation. The verifier bailed at this static-grep stage (0.31s) and never ran the checker — the canary gate and hidden tests were `skipped`, leaving the agent's real performance entirely unmeasured.

Because the reward does not reflect the agent's actual work — a working, ~50% checker was scored 0.0 by a substring collision in the anti-cheat regex — the outcome is **UNFAIR (false negative)**. The fix is a tighter anti-cheat pattern (word-boundary `\btsc\b` or exclusion of the `tscheck` name) and/or scoping the scan to the deliverable executable rather than the whole `/app/checker/` directory. Confidence is 0.9 rather than 1.0 because the checker source could not be inspected directly (artifact collection of `/app/workspace` failed, and the checker lives at `/app/checker/`), so I cannot independently re-run the canary gate to prove a strictly positive score — but the agent's self-verification logs and the unambiguous regex collision make the false-positive diagnosis clear.
