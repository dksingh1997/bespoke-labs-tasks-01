#!/bin/bash
APP_DIR="${APP_DIR:-/app}"
mkdir -p "$APP_DIR/src/aisc_d2"

cat > "$APP_DIR/src/aisc_d2/tension.py" << 'EOF'
"""AISC 360-22 §D2 — Correct implementation."""

from __future__ import annotations


def tensile_strength(
    Ag: float,
    Ae: float,
    Fy: float,
    Fu: float,
    method: str = "LRFD",
) -> dict:
    method_norm = method.upper()
    if method_norm not in ("LRFD", "ASD"):
        raise ValueError(f"Invalid method: {method!r}. Must be 'LRFD' or 'ASD'.")

    Pn_yield = Fy * Ag
    Pn_rupture = Fu * Ae

    if method_norm == "LRFD":
        Pa_yield = 0.90 * Pn_yield      # phi = 0.90 for yielding
        Pa_rupture = 0.75 * Pn_rupture  # phi = 0.75 for rupture (brittle)
    else:  # ASD
        Pa_yield = Pn_yield / 1.67      # Omega = 1.67 for yielding
        Pa_rupture = Pn_rupture / 2.00  # Omega = 2.00 for rupture

    Pa = min(Pa_yield, Pa_rupture)
    controls = "yielding" if Pa_yield <= Pa_rupture else "rupture"
    Pn = min(Pn_yield, Pn_rupture)

    return {
        "Pn_yield":   Pn_yield,
        "Pn_rupture": Pn_rupture,
        "Pn":         Pn,
        "Pa":         Pa,
        "controls":   controls,
    }
EOF
