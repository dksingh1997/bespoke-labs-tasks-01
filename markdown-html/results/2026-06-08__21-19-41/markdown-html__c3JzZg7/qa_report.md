# QA Report: markdown-html__c3JzZg7

## Verdict: UNFAIR

**Confidence**: 0.95
**Reward**: 0.5008

## Timing

**Agent execution**: 7200s / 2h 0m 0s (timed out — AgentTimeoutError)
**Verifier**: ~46s (started 23:22:10, finished 23:22:56)
**Agent setup**: ~46s (21:21:23 → 21:22:09)
**Timed out**: yes

## Agent Strategy

The agent never produced a working solution — it spent its entire 2-hour budget on exploration and was crippled by repeated LLM API timeouts, then hit the hard agent timeout.

- **Approach**: Exploratory ramp-up toward a from-scratch CommonMark C parser. Planned a cmark-style two-phase (block then inline) design but never started writing the actual parser.
- **Key steps**: (1) read the starter `Makefile`/`md2html.c`; (2) surveyed test-suite section distribution (Emphasis 95, Links 64, etc.); (3) generated an `entities.h` HTML5 entity table (2125 entities) via a Python script; (4) inspected a handful of edge-case tests to settle HTML-escaping behavior. That is the entire body of work.
- **Iterations**: Only 5 completed episodes (episode-0 through episode-4) over the full 2 hours. A 6th episode's LLM request was still pending when the timeout fired (no `response.txt` exists for episode-5).
- **Time allocation**: Nearly 100% reading/exploration, 0% implementation. Wall-clock was dominated by LLM API stalls, not by the agent's own work.
- **What worked / failed**: Critical failure — `md2html.c` was left **byte-identical to the starter stub**. Its `convert()` still contains `/* TODO */` and returns an empty string. The generated `entities.h` was never `#include`d and the Makefile was never updated to use it, so it had no effect on the build. The final binary is effectively the unmodified baseline: it reads stdin and prints nothing.
- **Strategy quality**: The plan (two-phase parser, pre-generate entity table) was reasonable in the abstract, but execution was catastrophically slow. The trajectory shows the agent was repeatedly stalled by `litellm.Timeout: ... Timeout passed=600.0` errors (trial.log records at least three 600s LLM connection timeouts; result.json `api_request_times_msec` includes a 881,831 ms request). A ~30 min gap (21:22→21:52) and a ~60 min gap (22:08→23:08) between episodes are pure API-stall dead time. Even discounting the API issues, spending the first several episodes exclusively on reconnaissance before writing any code was poor time allocation for a 2-hour, very-hard implementation task.

## Flags

### unmodified_baseline_scores_nonzero — HIGH
**Category**: FALSE_POSITIVE
**Evidence**: The agent's `md2html.c` is byte-identical to `environment/workspace/md2html.c` (`diff` reports no differences). Its `convert()` returns an empty string (`out[0] = '\0'`). The verifier scored this do-nothing binary **0.5008**: correctness 1/655 = 0.0015 (only the single empty-output test passes), but performance = **1.0** (perfect). Per the task's own hard rule ("Unmodified baseline must score exactly 0.0"), this is a violation — the starter stub earns over half the maximum reward.
**Recommendation**: Gate performance scoring on correctness. A converter that produces no output (or fails a minimum correctness threshold) must receive 0 performance credit. Options: (a) only count a perf benchmark if the agent's output on that file matches cmark's output; (b) multiply the performance subscore by the correctness rate, or require correctness_rate above some floor (e.g. 0.5) before any performance credit is awarded; (c) discard perf timings where the binary output length is implausibly small relative to expected HTML.

### performance_scoring_no_correctness_gate — HIGH
**Category**: VERIFIER_QUALITY
**Evidence**: In `tests/test.sh` (lines 286-318), the performance score is `min(1.0, (cmark_time * 5) / agent_time)` based purely on wall-clock time, with no check that the agent's output is correct. The verifier.log confirms the empty converter ran each 1-3 MB benchmark in ~0.013-0.015s vs cmark's ~0.064-0.075s, scoring 1.0 on all five benchmarks — precisely because it does no work. Composite weighting is 50% correctness + 50% performance, so a fast no-op captures the full 50% performance half.
**Recommendation**: Same as above — performance must be conditioned on producing correct output. Speed on garbage/empty output is meaningless and is the direct cause of the inflated 0.5008.

### llm_api_timeouts_consumed_budget — MEDIUM
**Category**: INFRASTRUCTURE_FAILURE
**Evidence**: trial.log records multiple `Unknown Error in LLM interaction: litellm.Timeout: AnthropicException ... Timeout passed=600.0, time taken=600.x seconds`. Episode timestamps show large dead-time gaps (21:22→21:52 and 22:08→23:08) with no agent activity, and result.json `api_request_times_msec` includes a 881,831 ms (≈14.7 min) request. These provider-side stalls consumed a large fraction of the 2-hour budget independent of the agent's own reasoning.
**Recommendation**: Note for fleet-level review — these are anthropic/litellm connection timeouts, not a task defect. They degraded this trial but did not cause the inflated reward; the reward inflation is a verifier-design issue. If such timeouts are common, consider retry/timeout tuning, but the trial's headline problem is the scoring flaw.

## Summary

The agent accomplished essentially nothing on the task: it spent all 2 hours exploring the test suite and generating an (unused) entity table, never wrote a single line of the parser, and left `md2html.c` byte-identical to the provided starter stub. Its compiled binary reads stdin and emits an empty string. The agent then hit `AgentTimeoutError` at the 7200s limit, with much of that wall-clock lost to repeated 600s LLM API connection timeouts.

Despite doing no real work, the trial was scored **0.5008**. The cause is a verifier design flaw: performance is scored purely on speed (`cmark_time*5 / agent_time`) with no correctness gate, so a do-nothing converter — which is trivially fast — earns a perfect 1.0 on all five performance benchmarks, capturing the full 50% performance weight. This directly violates the task's own "unmodified baseline must score exactly 0.0" rule. There was no reward-file tampering or anti-cheat circumvention (status `scored`, `cheat_detected=0`, strace shows zero reward-file writes); the anti-cheat layer worked correctly. The problem is purely that the scoring rewards fast-but-wrong output.

Verdict is **UNFAIR (false positive)**: the reward materially overstates the agent's performance — a non-solution received more than half the maximum reward. The fix is to condition performance credit on output correctness (e.g., only time benchmarks whose output matches cmark, or scale/gate performance by the correctness rate). The LLM API timeouts are a real but secondary infrastructure annoyance that degraded the run; they are not the reason the reward is wrong.
