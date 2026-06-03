Implement a Python function that calculates the available flexural strength of compact doubly symmetric I-shaped steel beams according to AISC 360-22, Chapter F.

You are given the text of the relevant standard clause below. Read it carefully, then implement the `calculate()` function in `calculator/main.py` to compute the design flexural strength per LRFD.

### Standard Clause: AISC 360-22, Section F2 — Doubly Symmetric Compact I-Shaped Members Bent About Their Major Axis

The available flexural strength shall be the lower value obtained according to the limit states of yielding (F2.1) and lateral-torsional buckling (F2.2).

---

#### Section F2.1 — Yielding

The nominal flexural strength for the limit state of yielding shall be:

    Mn = Mp = Fy × Zx

where:
- Fy = specified minimum yield stress of the type of steel being used (ksi)
- Zx = plastic section modulus about the major axis (in³)
- Mn = Mp = plastic moment

This limit state applies when the unbraced length Lb is less than or equal to Lp.

---

#### Section F2.2 — Lateral-Torsional Buckling

When Lb exceeds Lp, the available flexural strength shall be governed by the limit state of lateral-torsional buckling (LTB).

**For Lp < Lb ≤ Lr:**

    Mn = Cb × [Mp - (Mp - 0.7×Fy×Sx) × ((Lb - Lp) / (Lr - Lp))] ≤ Mp

**For Lb > Lr:**

    Mn = (Cb × π² × E × Sx) / (Lb / rts)² × √(1 + 0.078 × (J×c / (Sx×h0)) × (Lb / rts)²)

where:
- Lb = unbraced length (in), distance between points bracing the compression flange
- Lp = limiting unbraced length for yielding (in)
    Lp = 1.76 × ry × √(E / Fy)
- Lr = limiting unbraced length for inelastic LTB (in)
    Lr = 1.95 × rts × (E / (0.7×Fy)) × √(J×c / (Sx×h0) + √((J×c / (Sx×h0))² + 6.76 × (0.7×Fy / E)²))
- E = modulus of elasticity = 29,000 ksi
- Sx = elastic section modulus about the major axis (in³)
- ry = radius of gyration about the minor axis (in)
- rts = √(√(Iy×Cw) / Sx)  (in)
    where:
    - Iy = moment of inertia about the minor axis (in⁴)
    - Cw = warping constant (in⁶)
    - For standard I-shapes: rts can be approximated as rts = √(Iy×h0 / (2×Sx))
      where h0 = distance between flange centroids = d - tf (in)
      - d = depth of section (in)
      - tf = flange thickness (in)
- J = torsional constant (in⁴)
- c = 1 for doubly symmetric I-shapes (h0/2 × √(Iy/Cw) for general case)
- Cb = lateral-torsional buckling modification factor

The computed Mn shall not exceed Mp (yielding always governs for very short unbraced lengths).

---

#### Section F1 — General Provisions

**Applicability:** The provisions of Section F2 apply to compact I-shaped sections. A section is compact when:
- The flange is continuously connected to the web
- The width-to-thickness ratio of the compression flange bf/(2×tf) ≤ λp (compact limit)
- For AISC standard W-shapes with Fy ≤ 65 ksi: λp = 0.38×√(E/Fy)

**Resistance Factors (LRFD):**
- Flexural yielding: φ = 0.90
- Flexural LTB: φ = 0.90

**Available Strength:**
    φMn = φ × Mn

---

#### Input Format

The input is a JSON file containing:

```json
{
    "section": "W14x22",
    "Fy": 50.0,
    "Lb": 120.0,
    "Cb": 1.0,
    "units": "imperial"
}
```

Fields:
- `section`: AISC W-shape designation (e.g., "W14x22", "W21x50", "W36x150")
- `Fy`: yield stress in ksi
- `Lb`: unbraced length in inches
- `Cb`: lateral-torsional buckling modification factor (1.0 if not specified)
- `units`: "imperial" (always imperial for this task)

#### Output Format

The output must be a JSON file:

```json
{
    "Mn": 121.5,
    "Mp": 121.5,
    "phi": 0.9,
    "phi_Mn": 109.35,
    "failure_mode": "yielding",
    "limit_state": "F2.1",
    "Lp": 63.0,
    "Lr": 182.0
}
```

Fields:
- `Mn`: nominal flexural strength (kip-ft)
- `Mp`: plastic moment (kip-ft)
- `phi`: resistance factor (0.9 for all flexural limit states)
- `phi_Mn`: design flexural strength (kip-ft)
- `failure_mode`: one of "yielding", "inelastic_ltb", "elastic_ltb"
- `limit_state`: "F2.1" for yielding, "F2.2a" for inelastic LTB, "F2.2b" for elastic LTB
- `Lp`: limiting length Lp (in)
- `Lr`: limiting length Lr (in)

#### Section Properties

You need a lookup table of W-shape section properties. The test suite uses the following sections. You must include their properties in your implementation:

| Section | A (in²) | d (in) | bf (in) | tf (in) | tw (in) | Ix (in⁴) | Iy (in⁴) | Sx (in³) | Zx (in³) | ry (in) | J (in⁴) | Cw (in⁶) | h0 (in) |
|---------|---------|--------|---------|---------|---------|-----------|-----------|----------|----------|---------|---------|-----------|---------|
| W14x22  | 6.49    | 13.74  | 5.00    | 0.335   | 0.230   | 199       | 7.00      | 29.0     | 33.2     | 1.04    | 0.208   | 513       | 13.41   |
| W14x30  | 8.85    | 13.84  | 6.730   | 0.385   | 0.270   | 291       | 19.6      | 42.0     | 47.3     | 1.49    | 0.441   | 1440      | 13.46   |
| W14x43  | 12.6    | 13.66  | 7.995   | 0.530   | 0.305   | 428       | 45.2      | 62.7     | 69.6     | 1.89    | 1.13    | 3620      | 13.13   |
| W14x68  | 20.0    | 14.04  | 10.035  | 0.720   | 0.415   | 723       | 121       | 103      | 115      | 2.46    | 3.56    | 10800     | 13.32   |
| W14x90  | 26.5    | 14.02  | 14.520  | 0.710   | 0.445   | 999       | 362       | 143      | 157      | 3.70    | 7.01    | 30400     | 13.31   |
| W16x26  | 7.68    | 15.69  | 5.500   | 0.345   | 0.250   | 301       | 9.59      | 38.4     | 44.2     | 1.12    | 0.262   | 772       | 15.35   |
| W16x36  | 10.6    | 15.86  | 6.985   | 0.430   | 0.295   | 448       | 24.5      | 56.5     | 64.0     | 1.52    | 0.545   | 1990      | 15.43   |
| W18x35  | 10.3    | 17.70  | 6.000   | 0.425   | 0.300   | 510       | 15.3      | 57.6     | 66.5     | 1.22    | 0.506   | 1670      | 17.28   |
| W18x50  | 14.7    | 17.99  | 7.495   | 0.570   | 0.355   | 800       | 40.1      | 88.9     | 101      | 1.65    | 1.24    | 4490      | 17.42   |
| W18x76  | 22.3    | 18.21  | 11.035  | 0.680   | 0.425   | 1330      | 152       | 146      | 163      | 2.61    | 3.50    | 13900     | 17.53   |
| W21x50  | 14.7    | 20.83  | 8.220   | 0.535   | 0.380   | 984       | 24.9      | 94.5     | 110      | 1.30    | 1.14    | 3370      | 20.30   |
| W21x62  | 18.3    | 20.99  | 8.240   | 0.615   | 0.400   | 1170      | 30.6      | 111      | 127      | 1.29    | 1.67    | 4350      | 20.38   |
| W21x83  | 24.3    | 21.43  | 8.355   | 0.835   | 0.515   | 1600      | 41.0      | 149      | 171      | 1.30    | 3.66    | 6130      | 20.60   |
| W24x55  | 16.2    | 23.57  | 7.005   | 0.505   | 0.395   | 1140      | 22.5      | 97.0     | 112      | 1.18    | 0.982   | 3020      | 23.07   |
| W24x84  | 24.7    | 24.10  | 9.020   | 0.770   | 0.470   | 1830      | 82.7      | 152      | 172      | 1.83    | 3.70    | 11200     | 23.33   |
| W27x84  | 24.7    | 26.71  | 9.960   | 0.640   | 0.460   | 2100      | 70.6      | 157      | 181      | 1.69    | 2.81    | 8890      | 26.07   |
| W30x99  | 29.1    | 29.65  | 10.450  | 0.670   | 0.520   | 2940      | 93.0      | 198      | 226      | 1.79    | 3.77    | 14100     | 28.98   |
| W33x118 | 34.7    | 32.86  | 11.535  | 0.740   | 0.550   | 4220      | 142       | 257      | 294      | 2.02    | 5.52    | 23700     | 32.12   |
| W36x150 | 44.2    | 35.85  | 12.000  | 0.940   | 0.625   | 6320      | 183       | 353      | 402      | 2.03    | 9.36    | 34100     | 34.91   |
| W36x230 | 67.6    | 36.67  | 12.115  | 1.350   | 0.760   | 9580      | 267       | 522      | 588      | 1.99    | 25.7    | 55000     | 35.32   |

**Note:** All section properties use imperial units (inches). The `rts` value must be computed from Iy, Cw, Sx, and h0 as described in Section F2.2.

### Requirements

- Implement the function in `calculator/main.py`
- Read the input JSON from `argv[1]`, write output JSON to `argv[2]`
- Use the exact formulas from the standard (no approximations)
- All outputs must be in kip-ft (convert from kip-in by dividing by 12)
- Handle all three limit states: yielding, inelastic LTB, elastic LTB
- Include the section property lookup table in your code

### How to run

```bash
python3 calculator/main.py input.json output.json
```

### How to run the test suite

```bash
bash calculator/tests/run_suite.sh
```
