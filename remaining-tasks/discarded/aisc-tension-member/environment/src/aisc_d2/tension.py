"""AISC 360-22 §D2 — Design tensile strength of steel members.

Edit this file to implement tensile_strength correctly.
"""

from __future__ import annotations


def tensile_strength(
    Ag: float,
    Ae: float,
    Fy: float,
    Fu: float,
    method: str = "LRFD",
) -> dict:
    """Compute design tensile strength per AISC 360-22 §D2.

    Parameters
    ----------
    Ag : Gross area (in^2)
    Ae : Effective net area (in^2)
    Fy : Yield stress (ksi)
    Fu : Tensile strength (ksi)
    method : "LRFD" or "ASD" (case-insensitive)

    Returns
    -------
    dict with keys: Pn_yield, Pn_rupture, Pn, Pa, controls
    """
    method_norm = method.upper()
    if method_norm not in ("LRFD", "ASD"):
        raise ValueError(f"Invalid method: {method!r}. Must be 'LRFD' or 'ASD'.")

    # Nominal strengths (Eqs. D2-1 and D2-2)
    Pn_yield = Fy * Ag
    Pn_rupture = Fu * Ae

    # BUG: both limit states use phi = 0.90, ignoring the lower phi = 0.75
    # for tensile rupture. This is a classic "wrong phi factor" bug — the
    # rupture limit state should be more heavily penalised because it is a
    # brittle, non-ductile failure mode.
    if method_norm == "LRFD":
        Pa_yield = 0.90 * Pn_yield
        Pa_rupture = 0.90 * Pn_rupture   # BUG: should be 0.75
    else:  # ASD
        Pa_yield = Pn_yield / 1.67
        Pa_rupture = Pn_rupture / 1.67   # BUG: should be / 2.00

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
