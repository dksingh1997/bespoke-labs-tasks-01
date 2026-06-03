#!/usr/bin/env python3
"""
Generate test cases for the AISC 360-22 F2.1 calculator task.

Creates parametric cases across 20 W-shapes and various unbraced lengths,
covering all three limit states (yielding, inelastic LTB, elastic LTB).

Also generates hidden variants with different parameters.
"""

import json
import math
import os
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_CASES_DIR = BASE_DIR / "environment" / "calculator" / "tests" / "cases"
HIDDEN_CASES_DIR = BASE_DIR / "tests" / "hidden_cases"

E = 29000.0
PHI = 0.90

W_SHAPES = {
    "W14x22":  {"Sx": 29.0,  "Zx": 33.2,  "ry": 1.04,  "Iy": 7.00,  "J": 0.208, "Cw": 513,    "h0": 13.41},
    "W14x30":  {"Sx": 42.0,  "Zx": 47.3,  "ry": 1.49,  "Iy": 19.6,  "J": 0.441, "Cw": 1440,   "h0": 13.46},
    "W14x43":  {"Sx": 62.7,  "Zx": 69.6,  "ry": 1.89,  "Iy": 45.2,  "J": 1.13,  "Cw": 3620,   "h0": 13.13},
    "W14x68":  {"Sx": 103,   "Zx": 115,   "ry": 2.46,  "Iy": 121,   "J": 3.56,  "Cw": 10800,  "h0": 13.32},
    "W14x90":  {"Sx": 143,   "Zx": 157,   "ry": 3.70,  "Iy": 362,   "J": 7.01,  "Cw": 30400,  "h0": 13.31},
    "W16x26":  {"Sx": 38.4,  "Zx": 44.2,  "ry": 1.12,  "Iy": 9.59,  "J": 0.262, "Cw": 772,    "h0": 15.35},
    "W16x36":  {"Sx": 56.5,  "Zx": 64.0,  "ry": 1.52,  "Iy": 24.5,  "J": 0.545, "Cw": 1990,   "h0": 15.43},
    "W18x35":  {"Sx": 57.6,  "Zx": 66.5,  "ry": 1.22,  "Iy": 15.3,  "J": 0.506, "Cw": 1670,   "h0": 17.28},
    "W18x50":  {"Sx": 88.9,  "Zx": 101,   "ry": 1.65,  "Iy": 40.1,  "J": 1.24,  "Cw": 4490,   "h0": 17.42},
    "W18x76":  {"Sx": 146,   "Zx": 163,   "ry": 2.61,  "Iy": 152,   "J": 3.50,  "Cw": 13900,  "h0": 17.53},
    "W21x50":  {"Sx": 94.5,  "Zx": 110,   "ry": 1.30,  "Iy": 24.9,  "J": 1.14,  "Cw": 3370,   "h0": 20.30},
    "W21x62":  {"Sx": 111,   "Zx": 127,   "ry": 1.29,  "Iy": 30.6,  "J": 1.67,  "Cw": 4350,   "h0": 20.38},
    "W21x83":  {"Sx": 149,   "Zx": 171,   "ry": 1.30,  "Iy": 41.0,  "J": 3.66,  "Cw": 6130,   "h0": 20.60},
    "W24x55":  {"Sx": 97.0,  "Zx": 112,   "ry": 1.18,  "Iy": 22.5,  "J": 0.982, "Cw": 3020,   "h0": 23.07},
    "W24x84":  {"Sx": 152,   "Zx": 172,   "ry": 1.83,  "Iy": 82.7,  "J": 3.70,  "Cw": 11200,  "h0": 23.33},
    "W27x84":  {"Sx": 157,   "Zx": 181,   "ry": 1.69,  "Iy": 70.6,  "J": 2.81,  "Cw": 8890,   "h0": 26.07},
    "W30x99":  {"Sx": 198,   "Zx": 226,   "ry": 1.79,  "Iy": 93.0,  "J": 3.77,  "Cw": 14100,  "h0": 28.98},
    "W33x118": {"Sx": 257,   "Zx": 294,   "ry": 2.02,  "Iy": 142,   "J": 5.52,  "Cw": 23700,  "h0": 32.12},
    "W36x150": {"Sx": 353,   "Zx": 402,   "ry": 2.03,  "Iy": 183,   "J": 9.36,  "Cw": 34100,  "h0": 34.91},
    "W36x230": {"Sx": 522,   "Zx": 588,   "ry": 1.99,  "Iy": 267,   "J": 25.7,  "Cw": 55000,  "h0": 35.32},
}


def compute_rts(Iy, Cw, Sx):
    return math.sqrt(math.sqrt(Iy * Cw) / Sx)


def compute_Lp(ry, Fy):
    return 1.76 * ry * math.sqrt(E / Fy)


def compute_Lr(ry, Iy, Cw, Sx, J, h0, Fy):
    rts = compute_rts(Iy, Cw, Sx)
    t1 = J * 1.0 / (Sx * h0)
    t2 = math.sqrt(t1**2 + 6.76 * (0.7 * Fy / E)**2)
    return 1.95 * rts * (E / (0.7 * Fy)) * math.sqrt(t1 + t2)


def compute_Mn(section, Fy, Lb, Cb=1.0):
    p = W_SHAPES[section]
    Zx, Sx, ry, Iy, J, Cw, h0 = p["Zx"], p["Sx"], p["ry"], p["Iy"], p["J"], p["Cw"], p["h0"]
    Mp = Fy * Zx
    Lp = compute_Lp(ry, Fy)
    Lr = compute_Lr(ry, Iy, Cw, Sx, J, h0, Fy)

    if Lb <= Lp:
        Mn = Mp
        fm, ls = "yielding", "F2.1"
    elif Lb <= Lr:
        Mn = Cb * (Mp - (Mp - 0.7 * Fy * Sx) * ((Lb - Lp) / (Lr - Lp)))
        Mn = min(Mn, Mp)
        fm, ls = "inelastic_ltb", "F2.2a"
    else:
        rts = compute_rts(Iy, Cw, Sx)
        t1 = J / (Sx * h0)
        Fcr = (Cb * math.pi**2 * E) / (Lb / rts)**2 * math.sqrt(1 + 0.078 * t1 * (Lb / rts)**2)
        Mn = Fcr * Sx
        Mn = min(Mn, Mp)
        fm, ls = "elastic_ltb", "F2.2b"

    return {
        "Mn": round(Mn / 12, 4),
        "Mp": round(Mp / 12, 4),
        "phi": PHI,
        "phi_Mn": round(PHI * Mn / 12, 4),
        "failure_mode": fm,
        "limit_state": ls,
        "Lp": round(Lp, 4),
        "Lr": round(Lr, 4),
    }


def generate_cases():
    """Generate parametric test cases."""
    cases = []

    for section, props in W_SHAPES.items():
        Fy = 50.0  # A992 steel
        Lp = compute_Lp(props["ry"], Fy)
        Lr = compute_Lr(props["ry"], props["Iy"], props["Cw"], props["Sx"], props["J"], props["h0"], Fy)

        # Case 1: Very short unbraced length (yielding governs)
        Lb = round(Lp * 0.3, 1)
        cases.append({
            "section": section, "Fy": Fy, "Lb": Lb, "Cb": 1.0,
            "description": f"{section} yielding (Lb={Lb} < Lp={round(Lp,1)})"
        })

        # Case 2: Just at Lp boundary (yielding)
        Lb = round(Lp * 0.95, 1)
        cases.append({
            "section": section, "Fy": Fy, "Lb": Lb, "Cb": 1.0,
            "description": f"{section} at Lp boundary (Lb={Lb} ≈ Lp={round(Lp,1)})"
        })

        # Case 3: Midway between Lp and Lr (inelastic LTB)
        Lb = round(Lp + (Lr - Lp) * 0.5, 1)
        cases.append({
            "section": section, "Fy": Fy, "Lb": Lb, "Cb": 1.0,
            "description": f"{section} inelastic LTB (Lb={Lb})"
        })

        # Case 4: Just below Lr (inelastic LTB)
        Lb = round(Lr * 0.95, 1)
        cases.append({
            "section": section, "Fy": Fy, "Lb": Lb, "Cb": 1.0,
            "description": f"{section} near Lr (Lb={Lb} ≈ Lr={round(Lr,1)})"
        })

        # Case 5: Beyond Lr (elastic LTB)
        Lb = round(Lr * 2.0, 1)
        cases.append({
            "section": section, "Fy": Fy, "Lb": Lb, "Cb": 1.0,
            "description": f"{section} elastic LTB (Lb={Lb} > Lr={round(Lr,1)})"
        })

    # Add Cb variation cases (select a few sections)
    for section in ["W14x68", "W21x50", "W30x99"]:
        props = W_SHAPES[section]
        Fy = 50.0
        Lp = compute_Lp(props["ry"], Fy)
        Lr = compute_Lr(props["ry"], props["Iy"], props["Cw"], props["Sx"], props["J"], props["h0"], Fy)
        Lb = round(Lp + (Lr - Lp) * 0.6, 1)
        for Cb in [1.0, 1.14, 1.32, 1.67, 2.27]:
            cases.append({
                "section": section, "Fy": Fy, "Lb": Lb, "Cb": Cb,
                "description": f"{section} Cb={Cb} (Lb={Lb})"
            })

    # Add Fy variation cases
    for section in ["W14x43", "W21x62", "W36x150"]:
        for Fy in [36.0, 50.0, 65.0]:
            props = W_SHAPES[section]
            Lp = compute_Lp(props["ry"], Fy)
            Lr = compute_Lr(props["ry"], props["Iy"], props["Cw"], props["Sx"], props["J"], props["h0"], Fy)
            Lb = round(Lp + (Lr - Lp) * 0.4, 1)
            cases.append({
                "section": section, "Fy": Fy, "Lb": Lb, "Cb": 1.0,
                "description": f"{section} Fy={Fy} (Lb={Lb})"
            })

    return cases


def write_cases(cases, output_dir, start_num=1):
    """Write test cases to disk."""
    output_dir.mkdir(parents=True, exist_ok=True)
    case_map = {}

    for i, case in enumerate(cases, start=start_num):
        case_name = f"case_{i:03d}"
        case_dir = output_dir / case_name
        case_dir.mkdir(parents=True, exist_ok=True)

        # Input
        inp = {
            "section": case["section"],
            "Fy": case["Fy"],
            "Lb": case["Lb"],
            "Cb": case["Cb"],
            "units": "imperial"
        }
        with open(case_dir / "input.json", "w") as f:
            json.dump(inp, f, indent=2)

        # Expected
        expected = compute_Mn(case["section"], case["Fy"], case["Lb"], case["Cb"])
        with open(case_dir / "expected.json", "w") as f:
            json.dump(expected, f, indent=2)

        case_map[case_name] = {
            "section": case["section"],
            "Fy": case["Fy"],
            "Lb": case["Lb"],
            "Cb": case["Cb"],
            "description": case.get("description", ""),
        }

    return case_map


def generate_hidden_variants(cases):
    """Generate hidden variants with slightly different parameters."""
    variants = []
    import random
    random.seed(42)

    for case in cases[:50]:  # Use first 50 cases for variants
        # Vary Lb by ±10-20%
        factor = random.uniform(0.85, 1.15)
        new_Lb = round(case["Lb"] * factor, 1)
        if new_Lb > 0:
            variants.append({
                "section": case["section"],
                "Fy": case["Fy"],
                "Lb": new_Lb,
                "Cb": case["Cb"],
                "description": f"Variant: {case['section']} Lb={new_Lb}"
            })

    return variants


def main():
    print("=" * 60)
    print("  AISC 360-22 F2.1 Calculator Case Generator")
    print("=" * 60)

    # Clean
    if ENV_CASES_DIR.exists():
        shutil.rmtree(ENV_CASES_DIR)
    if HIDDEN_CASES_DIR.exists():
        shutil.rmtree(HIDDEN_CASES_DIR)

    # Generate original cases
    print("\nGenerating cases...")
    cases = generate_cases()
    print(f"  Generated {len(cases)} cases")

    # Write original cases
    print(f"\nWriting original cases to {ENV_CASES_DIR}...")
    case_map = write_cases(cases, ENV_CASES_DIR)
    print(f"  Wrote {len(case_map)} cases")

    # Generate and write hidden variants
    print(f"\nGenerating hidden variants...")
    variants = generate_hidden_variants(cases)
    hidden_map = write_cases(variants, HIDDEN_CASES_DIR, start_num=1)
    print(f"  Wrote {len(hidden_map)} hidden variants")

    # Write case mapping
    mapping_file = BASE_DIR / "tests" / "case_mapping.json"
    with open(mapping_file, "w") as f:
        json.dump(case_map, f, indent=2)

    # Count by limit state
    yielding = sum(1 for c in cases if compute_Mn(c["section"], c["Fy"], c["Lb"], c["Cb"])["failure_mode"] == "yielding")
    inelastic = sum(1 for c in cases if compute_Mn(c["section"], c["Fy"], c["Lb"], c["Cb"])["failure_mode"] == "inelastic_ltb")
    elastic = sum(1 for c in cases if compute_Mn(c["section"], c["Fy"], c["Lb"], c["Cb"])["failure_mode"] == "elastic_ltb")

    print("\n" + "=" * 60)
    print("  Summary")
    print("=" * 60)
    print(f"  Total cases:        {len(cases)}")
    print(f"  Yielding (F2.1):    {yielding}")
    print(f"  Inelastic LTB:      {inelastic}")
    print(f"  Elastic LTB:        {elastic}")
    print(f"  Hidden variants:    {len(variants)}")
    print(f"  Original dir:       {ENV_CASES_DIR}")
    print(f"  Hidden dir:         {HIDDEN_CASES_DIR}")
    print(f"  Case mapping:       {mapping_file}")
    print("=" * 60)
    print("  Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
