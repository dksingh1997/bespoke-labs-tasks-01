#!/usr/bin/env python3
"""
AISC 360-22 Flexural Strength Calculator

Computes the available flexural strength of doubly symmetric compact I-shaped
steel beams per AISC 360-22, Chapter F (Sections F2.1 and F2.2).

Usage:
    python main.py <input.json> <output.json>

Input: JSON with section, Fy, Lb, Cb
Output: JSON with Mn, Mp, phi, phi_Mn, failure_mode, limit_state, Lp, Lr
"""

import json
import math
import sys


# AISC 360-22 constants
E = 29000.0  # ksi
PHI_FLEXURE = 0.90  # LRFD resistance factor for flexure


# W-shape section properties table
# Keys: section name
# Values: dict with A, d, bf, tf, tw, Ix, Iy, Sx, Zx, ry, J, Cw, h0
W_SHAPES = {
    "W14x22":  {"A": 6.49,  "d": 13.74, "bf": 5.000,  "tf": 0.335, "tw": 0.230, "Ix": 199,  "Iy": 7.00,  "Sx": 29.0,  "Zx": 33.2,  "ry": 1.04,  "J": 0.208, "Cw": 513,    "h0": 13.41},
    "W14x30":  {"A": 8.85,  "d": 13.84, "bf": 6.730,  "tf": 0.385, "tw": 0.270, "Ix": 291,  "Iy": 19.6,  "Sx": 42.0,  "Zx": 47.3,  "ry": 1.49,  "J": 0.441, "Cw": 1440,   "h0": 13.46},
    "W14x43":  {"A": 12.6,  "d": 13.66, "bf": 7.995,  "tf": 0.530, "tw": 0.305, "Ix": 428,  "Iy": 45.2,  "Sx": 62.7,  "Zx": 69.6,  "ry": 1.89,  "J": 1.13,  "Cw": 3620,   "h0": 13.13},
    "W14x68":  {"A": 20.0,  "d": 14.04, "bf": 10.035, "tf": 0.720, "tw": 0.415, "Ix": 723,  "Iy": 121,   "Sx": 103,   "Zx": 115,   "ry": 2.46,  "J": 3.56,  "Cw": 10800,  "h0": 13.32},
    "W14x90":  {"A": 26.5,  "d": 14.02, "bf": 14.520, "tf": 0.710, "tw": 0.445, "Ix": 999,  "Iy": 362,   "Sx": 143,   "Zx": 157,   "ry": 3.70,  "J": 7.01,  "Cw": 30400,  "h0": 13.31},
    "W16x26":  {"A": 7.68,  "d": 15.69, "bf": 5.500,  "tf": 0.345, "tw": 0.250, "Ix": 301,  "Iy": 9.59,  "Sx": 38.4,  "Zx": 44.2,  "ry": 1.12,  "J": 0.262, "Cw": 772,    "h0": 15.35},
    "W16x36":  {"A": 10.6,  "d": 15.86, "bf": 6.985,  "tf": 0.430, "tw": 0.295, "Ix": 448,  "Iy": 24.5,  "Sx": 56.5,  "Zx": 64.0,  "ry": 1.52,  "J": 0.545, "Cw": 1990,   "h0": 15.43},
    "W18x35":  {"A": 10.3,  "d": 17.70, "bf": 6.000,  "tf": 0.425, "tw": 0.300, "Ix": 510,  "Iy": 15.3,  "Sx": 57.6,  "Zx": 66.5,  "ry": 1.22,  "J": 0.506, "Cw": 1670,   "h0": 17.28},
    "W18x50":  {"A": 14.7,  "d": 17.99, "bf": 7.495,  "tf": 0.570, "tw": 0.355, "Ix": 800,  "Iy": 40.1,  "Sx": 88.9,  "Zx": 101,   "ry": 1.65,  "J": 1.24,  "Cw": 4490,   "h0": 17.42},
    "W18x76":  {"A": 22.3,  "d": 18.21, "bf": 11.035, "tf": 0.680, "tw": 0.425, "Ix": 1330, "Iy": 152,   "Sx": 146,   "Zx": 163,   "ry": 2.61,  "J": 3.50,  "Cw": 13900,  "h0": 17.53},
    "W21x50":  {"A": 14.7,  "d": 20.83, "bf": 8.220,  "tf": 0.535, "tw": 0.380, "Ix": 984,  "Iy": 24.9,  "Sx": 94.5,  "Zx": 110,   "ry": 1.30,  "J": 1.14,  "Cw": 3370,   "h0": 20.30},
    "W21x62":  {"A": 18.3,  "d": 20.99, "bf": 8.240,  "tf": 0.615, "tw": 0.400, "Ix": 1170, "Iy": 30.6,  "Sx": 111,   "Zx": 127,   "ry": 1.29,  "J": 1.67,  "Cw": 4350,   "h0": 20.38},
    "W21x83":  {"A": 24.3,  "d": 21.43, "bf": 8.355,  "tf": 0.835, "tw": 0.515, "Ix": 1600, "Iy": 41.0,  "Sx": 149,   "Zx": 171,   "ry": 1.30,  "J": 3.66,  "Cw": 6130,   "h0": 20.60},
    "W24x55":  {"A": 16.2,  "d": 23.57, "bf": 7.005,  "tf": 0.505, "tw": 0.395, "Ix": 1140, "Iy": 22.5,  "Sx": 97.0,  "Zx": 112,   "ry": 1.18,  "J": 0.982, "Cw": 3020,   "h0": 23.07},
    "W24x84":  {"A": 24.7,  "d": 24.10, "bf": 9.020,  "tf": 0.770, "tw": 0.470, "Ix": 1830, "Iy": 82.7,  "Sx": 152,   "Zx": 172,   "ry": 1.83,  "J": 3.70,  "Cw": 11200,  "h0": 23.33},
    "W27x84":  {"A": 24.7,  "d": 26.71, "bf": 9.960,  "tf": 0.640, "tw": 0.460, "Ix": 2100, "Iy": 70.6,  "Sx": 157,   "Zx": 181,   "ry": 1.69,  "J": 2.81,  "Cw": 8890,   "h0": 26.07},
    "W30x99":  {"A": 29.1,  "d": 29.65, "bf": 10.450, "tf": 0.670, "tw": 0.520, "Ix": 2940, "Iy": 93.0,  "Sx": 198,   "Zx": 226,   "ry": 1.79,  "J": 3.77,  "Cw": 14100,  "h0": 28.98},
    "W33x118": {"A": 34.7,  "d": 32.86, "bf": 11.535, "tf": 0.740, "tw": 0.550, "Ix": 4220, "Iy": 142,   "Sx": 257,   "Zx": 294,   "ry": 2.02,  "J": 5.52,  "Cw": 23700,  "h0": 32.12},
    "W36x150": {"A": 44.2,  "d": 35.85, "bf": 12.000, "tf": 0.940, "tw": 0.625, "Ix": 6320, "Iy": 183,   "Sx": 353,   "Zx": 402,   "ry": 2.03,  "J": 9.36,  "Cw": 34100,  "h0": 34.91},
    "W36x230": {"A": 67.6,  "d": 36.67, "bf": 12.115, "tf": 1.350, "tw": 0.760, "Ix": 9580, "Iy": 267,   "Sx": 522,   "Zx": 588,   "ry": 1.99,  "J": 25.7,  "Cw": 55000,  "h0": 35.32},
}


def calculate(section: str, Fy: float, Lb: float, Cb: float = 1.0) -> dict:
    """
    Calculate available flexural strength per AISC 360-22, Chapter F.

    Args:
        section: AISC W-shape designation (e.g., "W14x22")
        Fy: specified minimum yield stress (ksi)
        Lb: unbraced length (in)
        Cb: lateral-torsional buckling modification factor

    Returns:
        dict with Mn, Mp, phi, phi_Mn, failure_mode, limit_state, Lp, Lr

    TODO: Implement this function following the formulas in instruction.md
    """
    raise NotImplementedError("Calculator not implemented yet")


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <input.json> <output.json>", file=sys.stderr)
        sys.exit(1)

    with open(sys.argv[1], "r") as f:
        data = json.load(f)

    section = data["section"]
    Fy = float(data["Fy"])
    Lb = float(data["Lb"])
    Cb = float(data.get("Cb", 1.0))

    result = calculate(section, Fy, Lb, Cb)

    with open(sys.argv[2], "w") as f:
        json.dump(result, f, indent=2)


if __name__ == "__main__":
    main()
