# QA Report: tcc-optimize-heapsort__RqEd74a

## Verdict: FAIR

**Confidence**: 0.96
**Reward**: 0.0

## Timing

**Agent execution**: 7200s / 2h 0m 0s (timed out — used full budget)
**Verifier**: 248s / ~4m 8s
**Agent setup**: 23s
**Timed out**: yes (AgentTimeoutError after 7200.0s)

## Agent Strategy

The agent attempted a genuine, technically sophisticated compiler-optimization effort on TCC's x86_64 code generator, targeting the heapsort hot path. It did NOT achieve a meaningful speedup, and the 0.0 reward accurately reflects that.

- **Approach**: Incremental, measurement-driven codegen optimization with conservative anti-regression discipline. Established a fresh baseline, profiled the heapsort hot loop, then iterated on targeted peephole/instruction-selection changes in `x86_64-gen.c` / `tccgen.c`, validating correctness after each change and reverting anything that didn't help or risked the correctness gate.
- **Key steps**:
  1. Backed up `x86_64-gen.c`, `tccgen.c`, `tcc.h`; measured baseline heapsort runtime (~2.79–2.97s).
  2. Tried register-pool / RC_INT expansion changes — found they produced **byte-identical** output (zero benefit), reverted them.
  3. Decoded the hot inner loop; implemented a load+sign-extend fusion (`mov j,%eax; movslq %eax,%rax` → single `movslq mem,reg` in `gen_cvt_sxtw`), restricted to safe in-memory lvalues. Verified correct but perf-neutral.
  4. Attempted scaled-LEA / SIB-address fusion (`shl $k; add base` → `lea (base,index,2^k)`) to shorten the address-computation dependency chain. Still perf-neutral.
  5. Ran final A/B (25 runs): `mean(A−B)=−0.0048` (its build was marginally slower than baseline).
- **Iterations**: 109 episodes over the full 2 hours. Many edit→build→correctness→A/B cycles. Not a stuck loop — the agent adapted (abandoned register-pool changes when proven useless, pivoted to instruction selection, then to address-chain fusion).
- **Time allocation**: Roughly balanced — substantial profiling/analysis (decoding the emitted assembly, testing CPU-bound vs memory-bound behavior at varying N), interleaved with implementation and validation. Heavy use of correctness runs to avoid gating to zero.
- **What worked / failed**: Correctness discipline worked (0 regressions; even 3 incidental new passes). The fundamental failure: heapsort is dominated by dependent-load latency and the loop-carried index recurrence through memory, so removing cheap ALU instructions yields no wall-clock improvement. The agent correctly diagnosed this itself ("perf-neutral because heapsort is bound by dependent-load latency... not cheap ALU ops") but ran out of time before finding a higher-leverage change, and the safe SIB/LEA change it could ship was also neutral.
- **Strategy quality**: Sound and appropriate. The agent chose reasonable, surgically-guarded codegen changes, profiled before committing, reverted no-ops, and protected the correctness gate. The reason for 0 reward is task difficulty (the benchmark is memory-latency bound, so the easy codegen wins don't move the needle), not a misguided approach or a loop.

## Flags

(none)

## Summary

This trial is a clean FAIR outcome. The agent timed out at the full 7200s budget (`AgentTimeoutError`), but the verifier still ran to completion (`verify_status.txt = ok`) and produced a meaningful, trustworthy score. The hardened verifier built a pristine baseline TCC, built the agent's modified TCC as the non-root `agent` user under `strace -f`, ran the full correctness suite (949 pass / 34 expected-fail on BOTH baseline and modified — 0 regressions), byte-validated heapsort output against a root-only golden (match), and measured an interleaved median speedup of **0.984x** against a noise floor of **1.084x**. Per the scoring policy, speedup at or below the noise floor yields reward 0.0 — which is exactly what happened. The agent's own final A/B measurement independently confirmed its build was perf-neutral (marginally slower than baseline).

No reward hacking occurred and none was needed to catch: the strace log shows only the verifier's own `verify_status.txt` write to `/logs/verifier/` (PID 32724, the orchestration script running as root) — no agent-driven write of `reward.txt`/`reward.json`, no `LD_PRELOAD`, no binary replacement. Isolation held: agent code ran via `su agent -c 'env -i ...'`, `/tests` is root-only, `/logs/verifier` was locked (`chmod 700`) and wiped at verifier start, and the speedup/correctness/output gates all operated correctly. The verifier and task are well-designed (multi-layer anti-cheat, output-validation gate against miscompilation, variance-derived noise floor, oracle token-gated correctness exemption).

The result correctly reflects performance: this is a genuinely hard task (the heapsort benchmark is memory-latency bound, so straightforward instruction-selection peepholes are perf-neutral), the agent did real and correct compiler work but failed to produce a speedup above noise, and scoring 0.0 is the right outcome. Hard ≠ unfair; the instructions accurately describe the scoring basis (speedup vs baseline, gated on correctness), the resource limits were adequate (the agent built and tested TCC many times within budget), and the oracle path demonstrates a known successful approach exists.
