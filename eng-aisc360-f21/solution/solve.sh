#!/bin/bash
#
# Oracle solution: Copy the reference implementation.
#

set -e

echo "=== Oracle Solution: Installing reference AISC calculator ==="

cat > /app/calculator/main.py << 'PYTHON'
#!/usr/bin/env python3
"""Oracle AISC 360-22 F2 flexural strength calculator."""

import json
import math
import sys

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

def calculate(section, Fy, Lb, Cb=1.0):
    p = W_SHAPES[section]
    Zx, Sx, ry, Iy, J, Cw, h0 = p["Zx"], p["Sx"], p["ry"], p["Iy"], p["J"], p["Cw"], p["h0"]
    Mp = Fy * Zx
    Lp = 1.76 * ry * math.sqrt(E / Fy)
    rts = math.sqrt(math.sqrt(Iy * Cw) / Sx)
    c = 1.0
    t1 = J * c / (Sx * h0)
    t2 = math.sqrt(t1**2 + 6.76 * (0.7 * Fy / E)**2)
    Lr = 1.95 * rts * (E / (0.7 * Fy)) * math.sqrt(t1 + t2)

    if Lb <= Lp:
        Mn = Mp
        fm, ls = "yielding", "F2.1"
    elif Lb <= Lr:
        Mn = Cb * (Mp - (Mp - 0.7 * Fy * Sx) * ((Lb - Lp) / (Lr - Lp)))
        Mn = min(Mn, Mp)
        fm, ls = "inelastic_ltb", "F2.2a"
    else:
        Fcr = (Cb * math.pi**2 * E) / (Lb / rts)**2 * math.sqrt(1 + 0.078 * t1 * (Lb / rts)**2)
        Mn = Fcr * Sx
        Mn = min(Mn, Mp)
        fm, ls = "elastic_ltb", "F2.2b"

    return {
        "Mn": round(Mn / 12, 4), "Mp": round(Mp / 12, 4),
        "phi": PHI, "phi_Mn": round(PHI * Mn / 12, 4),
        "failure_mode": fm, "limit_state": ls,
        "Lp": round(Lp, 4), "Lr": round(Lr, 4),
    }

if __name__ == "__main__":
    with open(sys.argv[1]) as f:
        d = json.load(f)
    r = calculate(d["section"], float(d["Fy"]), float(d["Lb"]), float(d.get("Cb", 1.0)))
    with open(sys.argv[2], "w") as f:
        json.dump(r, f, indent=2)
PYTHON

echo "=== Oracle solution installed ==="

FIRST_CASE=$(ls -d /app/calculator/tests/cases/case_*/ 2>/dev/null | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    python3 /app/calculator/main.py "$FIRST_CASE/input.json" /tmp/oracle_test.json
    python3 -c "
import json
with open('/tmp/oracle_test.json') as f: a = json.load(f)
with open('$FIRST_CASE/expected.json') as f: e = json.load(f)
ok = all(abs(a[k]-e[k])/max(abs(e[k]),1e-10) <= 0.01 if isinstance(e[k],(int,float)) else a[k]==e[k] for k in e)
print(f'Sanity check: {\"PASSED\" if ok else \"FAILED\"} ($CASE_NAME)')
"
    rm -f /tmp/oracle_test.json
fi

echo "=== Oracle solution complete ==="
