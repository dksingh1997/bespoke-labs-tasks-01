# Plan: Engineering Standards Calculator Tasks

## Overview

A family of Harbor tasks where agents implement numerically exact Python calculators from published engineering design standards. Each task gives the agent a PDF-extracted text excerpt of a specific standard clause (AISC 360, ACI 318, Eurocode 3, AASHTO LRFD, ASHRAE 90.1, ISO 19901, etc.) and asks it to write a Python function that implements the calculation procedure. The oracle is the published formula itself. No ambiguity. No memorization.

## Why This Works

### The problem is formulaic but not memorizable
Every standard clause is a self-contained calculation procedure with defined inputs, outputs, intermediate steps, and numerically exact results. But the combination of correct formula + correct unit handling + correct table lookup + correct limit check almost never appears verbatim in training data. Models have to actually read the text, extract the procedure, and implement it correctly.

### The bugs mirror real engineering mistakes
The errors we test for are the same bugs practicing engineers make:
- Wrong unit conversion (kips vs kN, in^2 vs mm^2)
- Wrong load combination (1.2D + 1.6L vs 1.35D + 1.5L)
- Gross area vs net area (or vice versa)
- Wrong buckling curve (European vs American, K_corb vs K_org)
- Off-by-one in table interpolation
- Wrong axis selection (strong vs weak)
- Missing limit check
- Wrong safety/resistance factor

### Thousands of natural task variations
Hundreds of standards x dozens of chapters x multiple failure modes = effectively unlimited tasks. Each clause is independent. No cross-referencing needed. The text is the spec.

## Standards Coverage

| Standard | Domain | Chapters | Example Clauses |
|----------|--------|----------|-----------------|
| AISC 360 | Steel design | 14 | F2 flexural yielding, E3 column buckling, J3 bolt bearing |
| ACI 318 | Concrete design | 22 | 22.3 flexural strength, 22.5 shear, 25.7 development length |
| Eurocode 3 | Steel design | 12 | 6.2.4 bending, 6.3.1 lateral-torsional buckling |
| AASHTO LRFD | Bridge design | 14 | 6.10 flexure, 6.11 shear, 10.7 fatigue |
| ASHRAE 90.1 | Energy code | 12 | 5.5 envelope, 6.5 HVAC, 9.5 lighting |
| ISO 19901 | Offshore structures | 9 | 8.3 wave loading, 7.3 seismic |
| Eurocode 2 | Concrete design | 12 | 6.1 bending, 6.2 shear, 10.2 crack width |
| NDS (NDS) | Timber design | 12 | 3.3 flexure, 3.4 shear, 7.3 connections |
| AISI S100 | Cold-formed steel | 12 | C3.1 flexure, C4.1 compression |
| PCI | Precast concrete | 12 | 5.4 flexure, 5.5 shear, 7.2 transfer |

## Task Structure

```
eng-standard-<standard>-<clause>/
├── instruction.md              # Problem statement with full clause text
├── task.toml                   # Harbor config (difficulty, timeout)
├── README.md                   # Documentation
├── generate_cases.py           # Parametric case generator
├── standard_excerpt.txt        # The relevant clause text (agent reads this)
├── environment/
│   ├── Dockerfile              # Python 3.12 + numpy + scipy
│   └── calculator/
│       ├── main.py             # Entry point: implement calculate()
│       └── tests/
│           ├── run_suite.sh    # Test runner
│           └── cases/          # ~100 test cases (input.json + expected.json)
├── solution/
│   └── solve.sh                # Oracle: reference Python implementation
└── tests/
    ├── test.sh                 # Verifier
    ├── case_mapping.json
    └── hidden_cases/           # Variant cases with different parameters
```

## Case Format

Each test case is a JSON file:

```json
{
  "case_id": "case_001",
  "standard": "AISC 360-22",
  "clause": "F2.1",
  "description": "Flexural yielding strength of compact W-shape",
  "inputs": {
    "section": "W14x22",
    "Fy": 50.0,
    "Fy_unit": "ksi",
    "Lb": 15.0,
    "Lb_unit": "ft",
    "C": 1.0
  },
  "expected": {
    "Mn": 121.5,
    "Mn_unit": "kip-ft",
    "phi": 0.9,
    "phi_Mn": 109.35,
    "phi_Mn_unit": "kip-ft",
    "failure_mode": "yielding",
    "limiting_case": "Lp > Lb"
  },
  "intermediate": {
    "Zx": 40.2,
    "Zx_unit": "in^3",
    "Mp": 2010.0,
    "Mp_unit": "kip-in",
    "Lp": 63.0,
    "Lp_unit": "in"
  },
  "tolerance": 0.01
}
```

## How Cases Are Generated

`generate_cases.py` for each task:

1. **Extracts clause text** from the standard PDF (pre-processed to plain text)
2. **Identifies variables** in the formula (section properties, material properties, geometry)
3. **Creates parametric variations** by sweeping input ranges:
   - Different sections (W-shapes, HSS, angles, channels)
   - Different materials (A36, A572-50, A992, S355, S275)
   - Different geometries (lengths, widths, depths)
   - Different boundary conditions (fixed, pinned, cantilever)
4. **Computes expected outputs** using the reference implementation
5. **Generates hidden variants** with modified parameters (same formula, different numbers)
6. **Injects common engineering bugs** into distractor cases:
   - Unit conversion errors (multiply by 0.4536 instead of 4.448)
   - Wrong area type (gross instead of net)
   - Missing limit checks (skip Lp/Lr check for LTB)
   - Wrong resistance factor (phi = 0.85 instead of 0.9)
   - Wrong table lookup (interpolate between wrong rows)

## Example Tasks

### Task 1: AISC 360 F2.1 - Flexural Yielding

**Standard excerpt**: "The available flexural strength of compact doubly symmetric members bent about their major axis shall be the lower value obtained according to the limit states of yielding (F2.1) and lateral-torsional buckling (F2.2)..."

**Agent must implement**:
```python
def calculate_flexural_yielding(Fy: float, Zx: float) -> dict:
    """AISC 360-22, Section F2.1
    Mn = Mp = Fy * Zx (for compact sections)
    phi = 0.9 (LRFD)
    """
    Mp = Fy * Zx
    return {"Mn": Mp, "phi": 0.9, "phi_Mn": 0.9 * Mp}
```

**Common bug**: Using Sx (elastic section modulus) instead of Zx (plastic).

### Task 2: ACI 318 22.3 - Flexural Strength

**Standard excerpt**: "The design flexural strength at any section shall be phi*Mn... The nominal flexural strength Mn shall be computed based on strain compatibility..."

**Agent must implement**:
```python
def calculate_flexural_strength(fc, fy, b, d, As, beta1):
    """ACI 318-19, Section 22.3
    a = As*fy / (0.85*fc*b)
    c = a / beta1
    Mn = As*fy*(d - a/2)
    phi = 0.9 (tension-controlled)
    """
    a = As * fy / (0.85 * fc * b)
    Mn = As * fy * (d - a / 2)
    return {"Mn": Mn, "phi": 0.9, "phi_Mn": 0.9 * Mn}
```

**Common bug**: Using fc directly instead of 0.85*fc.

### Task 3: Eurocode 3 6.2.4 - Bending

**Standard excerpt**: "The design resistance moment for cross-sections subject to bending about one axis shall be taken as: Mc,Rd = (Wpl * fy) / gamma_M0..."

**Agent must implement**:
```python
def calculate_bending_resistance(fy, Wpl, gamma_M0=1.0, gamma_M1=1.0):
    """EN 1993-1-1, Section 6.2.4
    Mc,Rd = Wpl * fy / gamma_M0
    """
    Mc_Rd = Wpl * fy / gamma_M0
    return {"Mc_Rd": Mc_Rd, "failure_mode": "yielding"}
```

**Common bug**: Using gamma_M1 (for buckling) instead of gamma_M0 (for cross-section).

### Task 4: ASHRAE 90.1 5.5 - Envelope U-factor

**Standard excerpt**: "The maximum assembly U-factors for opaque building envelope assemblies shall not exceed the values in Table 5.5-1 through 5.5-8..."

**Agent must implement**:
```python
def calculate_envelope_u_factor(climate_zone, assembly_type, R_insulation, R_other):
    """ASHRAE 90.1-2022, Section 5.5
    U = 1 / (R_insulation + R_other + R_film)
    Check against Table 5.5-x limits
    """
    R_film = 0.17  # exterior film resistance
    U_actual = 1.0 / (R_insulation + R_other + R_film)
    U_max = lookup_table(climate_zone, assembly_type)
    return {
        "U_actual": U_actual,
        "U_max": U_max,
        "compliant": U_actual <= U_max
    }
```

**Common bug**: Forgetting film resistance or using wrong table for climate zone.

### Task 5: AASHTO LRFD 6.10 - Flexural Strength

**Standard excerpt**: "The flexural resistance of a component in positive flexure shall be taken as: Mn = As*fs*(d - a/2)..."

**Common bug**: Using ASD load factors instead of LRFD, or wrong phi factor for flexure vs shear.

## Why Models Fail

| Failure Mode | Description | Frequency |
|-------------|-------------|-----------|
| **Unit error** | kips vs kN, in vs mm, ksi vs MPa | Very common |
| **Wrong formula** | Confusing similar clauses across standards | Common |
| **Missing limit** | Skipping Lp/Lr check, forgetting phi factor | Common |
| **Wrong table** | Interpolating wrong table, wrong axis, off-by-one | Common |
| **Gross vs net** | Using Ag instead of An or vice versa | Occasional |
| **Wrong combination** | 1.2D+1.6L vs 1.35D+1.5L (LRFD vs Eurocode) | Occasional |
| **Wrong safety factor** | phi=0.9 vs phi=0.85 vs gamma=1.0 | Occasional |
| **Sign error** | Compression vs tension, positive vs negative moment | Rare |
| **Wrong curve** | European buckling curve (a,b,c,d) vs American (K) | Rare |

## Reward Function

```python
def reward(case_result, expected, tolerance=0.01):
    """
    Numerical comparison with tolerance.
    - Each output field compared independently
    - String fields (failure_mode) compared exactly
    - Boolean fields compared exactly
    - Numeric fields compared within tolerance (relative)
    """
    score = 0
    total = 0
    for key in expected:
        total += 1
        if key in case_result:
            if isinstance(expected[key], (int, float)):
                if abs(case_result[key] - expected[key]) / max(abs(expected[key]), 1e-10) <= tolerance:
                    score += 1
            elif case_result[key] == expected[key]:
                score += 1
    return score / total if total > 0 else 0.0
```

Each case is pass/fail with a relative tolerance of 1% on numeric outputs and exact match on string/boolean outputs.

## Initial Task Set (10 tasks)

| # | Task | Standard | Clause | Difficulty |
|---|------|----------|--------|------------|
| 1 | `eng-aisc360-f21` | AISC 360-22 | F2.1 Flexural Yielding | Medium |
| 2 | `eng-aisc360-e3` | AISC 360-22 | E3 Column Buckling | Hard |
| 3 | `eng-aci318-223` | ACI 318-19 | 22.3 Flexural Strength | Medium |
| 4 | `eng-aci318-225` | ACI 318-19 | 22.5 Shear Strength | Hard |
| 5 | `eng-ec3-624` | Eurocode 3 | 6.2.4 Bending | Medium |
| 6 | `eng-ec3-631` | Eurocode 3 | 6.3.1 Lateral-Torsional Buckling | Hard |
| 7 | `eng-aashto-610` | AASHTO LRFD | 6.10 Flexure | Hard |
| 8 | `eng-ashrae-55` | ASHRAE 90.1 | 5.5 Envelope | Medium |
| 9 | `eng-aisc360-j3` | AISC 360-22 | J3 Bolt Bearing | Medium |
| 10 | `eng-ec2-61` | Eurocode 2 | 6.1 Bending | Medium |

## Implementation Plan

### Phase 1: Infrastructure (week 1)
- [ ] Base Dockerfile with Python 3.12, numpy, scipy
- [ ] Case format spec (JSON schema)
- [ ] Test runner + verifier template
- [ ] Oracle solution template
- [ ] generate_cases.py template

### Phase 2: First 3 tasks (week 2)
- [ ] `eng-aisc360-f21` - Flexural yielding (simplest, validates pipeline)
- [ ] `eng-aci318-223` - Concrete flexure (different standard, validates generalization)
- [ ] `eng-ec3-624` - Eurocode bending (metric units, validates unit handling)

### Phase 3: Remaining 7 tasks (week 3)
- [ ] Implement remaining tasks
- [ ] Add hidden variant generation
- [ ] Add bug injection for distractor cases
- [ ] Validate all oracle solutions pass

### Phase 4: Evaluation (week 4)
- [ ] Run on Claude Opus 4.6, Sonnet 4, GPT-4o
- [ ] Document pass rates by standard and difficulty
- [ ] Identify which failure modes are most common
- [ ] Iterate on case difficulty if too easy/hard

## Running

```bash
# Install Harbor
uv tool install harbor

# Generate cases for a task
cd eng-aisc360-f21
python3 generate_cases.py

# Run with oracle (should give reward = 1.0)
harbor run -p . -k 1

# Run with an agent
export ANTHROPIC_API_KEY=sk-...
harbor run -p . -a claude-code -m anthropic/claude-opus-4-1

# Run all engineering tasks
for task in eng-aisc360-f21 eng-aisc360-e3 eng-aci318-223 eng-aci318-225 eng-ec3-624 eng-ec3-631 eng-aashto-610 eng-ashrae-55 eng-aisc360-j3 eng-ec2-61; do
    harbor run -p $task -a claude-code -m anthropic/claude-opus-4-1
done
```

## Expected Results

| Model | Expected Pass Rate | Why |
|-------|-------------------|-----|
| Claude Opus 4.6 | 40-60% | Strong at formula extraction, weak at unit/table details |
| Claude Sonnet 4 | 30-50% | Good reading comprehension, more unit errors |
| GPT-4o | 25-45% | Weaker at numerical precision and table interpolation |
| Codex CLI | 35-55% | Good at code, but needs to read standard text correctly |

The key differentiator is not "can the model code?" but "can the model read a dense engineering standard, extract the correct procedure, handle units and tables, and produce numerically exact results?"
