# AISC 360-22 F2.1 — Flexural Yielding Calculator

A [Harbor](https://github.com/harbor-framework/harbor) task that challenges an agent to implement a Python calculator for the available flexural strength of steel beams per AISC 360-22, Chapter F.

## The Challenge

The agent is given the text of AISC 360-22 Sections F1 and F2 (Yielding + Lateral-Torsional Buckling) and must implement a Python function that computes the design flexural strength φMn for any W-shape section. The test suite covers ~100 parametric cases across all three limit states (yielding, inelastic LTB, elastic LTB) with 20 different W-shapes.

**Difficulty:** Medium

## Why This Is Hard

The formula looks simple: Mn = Fy × Zx. But the full procedure requires:

1. **Section property lookup** — 20 W-shapes with 14 properties each (280 values)
2. **rts computation** — rts = √(√(Iy×Cw) / Sx), a derived property not in standard tables
3. **Three limit states** — Yielding (F2.1), Inelastic LTB (F2.2a), Elastic LTB (F2.2b)
4. **Limit checks** — Mn ≤ Mp (yielding cap), Cb factor application
5. **Unit conversion** — All section properties in kip-in, output in kip-ft (divide by 12)
6. **Edge cases** — Very short Lb (yielding), very long Lb (elastic LTB), Cb > 1.0

## Common Engineering Bugs

These are the bugs practicing engineers make, and models will too:

| Bug | Description | Example |
|-----|-------------|---------|
| Wrong units | Output in kip-in instead of kip-ft | Mn = 2010 instead of 167.5 |
| Skip limit state | Always compute yielding, never check LTB | Wrong answer for long beams |
| Missing Mp cap | Mn exceeds Mp for inelastic LTB formula | Mn = 1.2×Mp (impossible) |
| Wrong rts | Approximate rts instead of exact formula | 5-10% error in Lr |
| Missing Cb | Ignore the Cb modification factor | Conservative for Cb > 1 |
| Unit in Lp/Lr | Compute Lp in inches, compare to Lb in feet | Off by factor of 12 |

## Structure

```
eng-aisc360-f21/
├── instruction.md          # Full clause text + section property table
├── task.toml               # Harbor config
├── README.md               # This file
├── generate_cases.py       # Case generator
├── environment/
│   ├── Dockerfile          # Python 3.12 + numpy
│   └── calculator/
│       ├── main.py         # Agent implements calculate()
│       └── tests/
│           ├── run_suite.sh
│           └── cases/      # ~100 test cases
├── solution/
│   └── solve.sh            # Oracle: reference implementation
└── tests/
    ├── test.sh             # Verifier
    ├── case_mapping.json
    └── hidden_cases/       # Variant cases
```

## Reward Function

Numerical comparison with 1% relative tolerance:

```python
abs(actual - expected) / max(abs(expected), 1e-10) <= 0.01
```

String fields (failure_mode, limit_state) compared exactly.

## Results

| Model | Pass Rate | Passed | Total | Time |
|-------|-----------|--------|-------|------|
| (pending evaluation) | | | | |

## Running

```bash
uv tool install harbor
export ANTHROPIC_API_KEY=sk-...
harbor run -p . -a claude-code -m anthropic/claude-opus-4-1
```
