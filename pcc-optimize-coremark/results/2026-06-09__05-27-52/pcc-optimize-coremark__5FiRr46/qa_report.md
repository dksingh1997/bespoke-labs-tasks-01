# QA Report: pcc-optimize-coremark__5FiRr46

## Verdict: UNFAIR

**Confidence**: 0.95
**Reward**: 0.0

## Timing

**Agent execution**: 6148s (~102m 28s — from 05:28:20 to 07:10:48)
**Verifier**: 0.7s (from 07:10:48.89 to 07:10:49.62)
**Agent setup**: 16.5s
**Timed out**: no (agent marked task_complete on its own at episode 171; verifier ran but failed almost instantly)

## Agent Strategy

- **Approach**: Targeted compiler-internals optimization of PCC's amd64 codegen — add a peephole pass and tune alignment, validating each change against correctness suites and CoreMark.
- **Key steps**:
  1. Studied PCC source (`cc/ccom`, `arch/amd64`) and the benchmark/correctness harness.
  2. Modified `cc/ccom/main.c` to add an `asmpeep` peephole optimization (rbp-leaq fusion) wired into the compile pipeline.
  3. Set `ALFTN=128` in `arch/amd64/macdefs.h` (function alignment tuning).
  4. Rebuilt modified PCC + pcc-libs via the bootstrap compiler and ran the CoreMark performance suite and the full gcc-torture correctness suite (1682 tests).
  5. Verified CoreMark CRCs were byte-identical to the unmodified compiler (proving correctness) while measuring a ~3.5–4.5% speedup.
- **Iterations**: 172 episodes over ~102 minutes — sustained, non-looping work culminating in a self-declared completion with a working modified compiler.
- **Time allocation**: Heavy on analysis + repeated rebuild/benchmark/correctness cycles (PCC rebuilds and the ~10 min full correctness suite dominate wall time).
- **What worked / failed**: The agent's compiler changes worked — it produced a correct, faster PCC and validated it thoroughly. Nothing the agent did caused the 0.0 score.
- **Strategy quality**: Sound and disciplined. The agent chose an appropriate, surgical optimization for the problem scale, validated correctness against CRCs and an exhaustive torture suite, and avoided risky last-minute changes. This is a high-quality trajectory that genuinely improved generated-code speed within the constraints.

## Flags

### verifier_bug — HIGH
**Category**: FALSE_NEGATIVE
**Evidence**: The verifier log shows the failure occurred while building the **baseline** PCC (not the agent's modified PCC):
```
=== Step 1: Building Baseline PCC ===
bash: line 16: ./configure: Permission denied
Build/test phase did not complete: baseline_configure_failed
FAIL: baseline_configure_failed -> reward 0.0
```
The baseline source lives in the root-only `/tests/baseline-pcc` directory, which the agent cannot access or modify (`chmod 700 /tests` in the Dockerfile). Its `configure` script is non-executable: `stat` on `tests/baseline-pcc/configure` shows `-rw-rw-r--` (same for `config.sub`, `install-sh`). The strace log confirms the verifier copied it with mode 0664 and no exec bit:
```
openat("/tests/baseline-pcc/configure", O_RDONLY|O_NOFOLLOW) = 3
openat("/tmp/baseline-pcc/configure", O_WRONLY|O_CREAT|O_EXCL, 0664) = 4
```
`test.sh` line 36 only restores exec bits on `*.sh` files (`find /tests -type f -name '*.sh' -exec chmod +x`), but autotools scripts (`configure`, `config.sub`, `config.guess`, `install-sh`) have no `.sh` extension, so they remain non-executable. `docker compose cp` drops exec bits on upload — a fact the Dockerfile itself acknowledges (lines 23-30, 104-111) and works around for the agent's `/app` source, but the equivalent fix was never applied to `/tests/baseline-pcc`.
**Recommendation**: In `test.sh`, restore exec bits on the baseline autotools scripts before building, e.g. add to the lockdown section:
```bash
find /tests/baseline-pcc /tests/baseline-pcc-libs -type f \
  \( -name configure -o -name config.sub -o -name config.guess \
     -o -name install-sh -o -name missing -o -name depcomp \
     -o -name ylwrap -o -name compile -o -name mkinstalldirs \) \
  -exec chmod +x {} + 2>/dev/null || true
```
Alternatively check in the baseline `configure` scripts with the executable bit set and ensure `.gitattributes`/packaging preserves it.

### partial_success_unrewarded — HIGH
**Category**: FALSE_NEGATIVE
**Evidence**: The agent produced a working, correctness-preserving optimization (modified `cc/ccom/main.c` + `arch/amd64/macdefs.h`, collected as the `/app/compiler-src/pcc` artifact with edits timestamped 07:02). Its final report cites byte-identical CoreMark CRCs (0xe714/0x1fd7/0x8e3a/0x5275) vs baseline and a ~3.5–4.5% speedup, with 0 unexpected regressions across the 1682-test gcc-torture suite. The verifier never evaluated any of this — it aborted at baseline build, so the modified-PCC build/benchmark steps (Steps 2-4) never ran. The 0.0 is entirely an infrastructure artifact, not a reflection of the agent's performance.
**Recommendation**: After fixing the baseline exec-bit bug, re-run this trial. The reward should be re-derived from the actual baseline-vs-modified comparison.

## Summary

The agent did high-quality, legitimate work: it added a peephole optimization and alignment tuning to PCC's amd64 backend, rebuilt the compiler with the bootstrap toolchain, and validated correctness (byte-identical CoreMark CRCs and a clean 1682-test gcc-torture run) while measuring a ~3.5–4.5% CoreMark speedup. No reward hacking occurred; the strace audit found no reward-file tampering, and the failure path was reached well before any scoring logic.

The 0.0 reward is a **false negative caused by a verifier bug**. The verifier failed while building its own pristine baseline PCC from the root-only `/tests/baseline-pcc` directory: `./configure: Permission denied`. The baseline's autotools scripts (`configure`, etc.) lost their exec bits during Harbor's `docker compose cp` upload, and `test.sh` only restores exec bits on `*.sh` files — not the extensionless `configure`. Because the baseline build is verification infrastructure entirely outside the agent's control, and its failure hard-codes the reward to 0.0 (`compute_reward.py --fail baseline_configure_failed`), **no agent — including a perfect one — could ever score above 0.0 in this configuration**.

This is not an INFRASTRUCTURE_FAILURE in the sandbox-teardown sense (the verifier ran to completion in 0.7s and produced reward files); it is a deterministic logic bug in the verifier that systematically denies earned credit. Verdict: UNFAIR. The fix is a one-line `chmod +x` over the baseline autotools scripts in `test.sh`, after which this trial should be re-run.
