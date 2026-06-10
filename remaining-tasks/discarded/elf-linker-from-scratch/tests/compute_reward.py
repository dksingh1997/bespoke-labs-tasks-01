#!/usr/bin/env python3
"""Compute tiered reward for elf-linker-from-scratch task.

Tiers (weight increases with difficulty):
  T1 (0.08): Basic ELF -- single .o, inline syscall
  T2 (0.12): Cross-file linking -- function calls, data sections
  T3 (0.16): BSS + archive -- .bss section, .a parsing
  T4 (0.24): Structural + musl hello -- mold-adapted tests
  T5 (0.40): Complex musl -- printf, multi-file, common symbols

Anti-gaming: source code is inspected for banned patterns.
"""

import json
import os
import sys

RESULTS_FILE = "/tmp/test_results.json"
SOURCE_FILE = "/app/myld.c"
ORACLE_MARKER = "/app/.oracle_marker"

TIERS = {
    "t1": {"weight": 0.08, "tests": ["t1_t1_exit", "t1_t1_exit_elf"]},
    "t2": {"weight": 0.12, "tests": ["t2_t2_hello", "t2_t2_data", "t2_t2_hello_elf"]},
    "t3": {"weight": 0.16, "tests": ["t3_t3_bss", "t3_t3_archive"]},
    "t4": {"weight": 0.24, "tests": ["t4_entry", "t4_sections", "t4_nostdlib", "t4_hello_libc"]},
    "t5": {"weight": 0.40, "tests": ["t5_printf", "t5_multi", "t5_common"]},
}

BANNED_PATTERNS = [
    'execvp("ld"',
    "execvp(\"ld\"",
    'execvp("gcc"',
    "execvp(\"gcc\"",
    'execvp("musl-gcc"',
    "execvp(\"musl-gcc\"",
    "system(",
    "popen(",
    'execvp("collect2"',
    "execvp(\"collect2\"",
]

MIN_CODE_LINES = 150


def load_results():
    if not os.path.exists(RESULTS_FILE):
        print("No results file found", file=sys.stderr)
        return {}
    with open(RESULTS_FILE) as f:
        data = json.load(f)
    return data.get("tests", {})


def check_anti_gaming():
    """Return (is_clean, reason) -- skipped if oracle marker exists."""
    if os.path.exists(ORACLE_MARKER):
        return True, "oracle bypass"

    if not os.path.exists(SOURCE_FILE):
        return False, "source file not found"

    with open(SOURCE_FILE) as f:
        source = f.read()

    source_lower = source.lower()

    for pattern in BANNED_PATTERNS:
        if pattern.lower() in source_lower:
            return False, f"banned pattern: {pattern}"

    non_blank = sum(1 for line in source.splitlines() if line.strip())
    if non_blank < MIN_CODE_LINES:
        return False, f"too short: {non_blank} non-blank lines (need {MIN_CODE_LINES})"

    return True, "clean"


def compute():
    results = load_results()
    is_clean, reason = check_anti_gaming()

    total_reward = 0.0
    tier_details = {}

    for tier_name, tier_info in TIERS.items():
        tests = tier_info["tests"]
        weight = tier_info["weight"]

        passed = sum(1 for t in tests if results.get(t) == "pass")
        fraction = passed / len(tests) if tests else 0
        tier_reward = weight * fraction
        total_reward += tier_reward

        tier_details[tier_name] = {
            "passed": passed,
            "total": len(tests),
            "fraction": round(fraction, 3),
            "weighted": round(tier_reward, 4),
        }

    if not is_clean:
        penalty = total_reward
        total_reward = 0.0
        print(f"ANTI-GAMING PENALTY: {reason} (lost {penalty:.4f})", file=sys.stderr)

    total_reward = round(min(max(total_reward, 0.0), 1.0), 4)

    print(f"\n=== Reward Breakdown ===")
    for tier_name in sorted(tier_details):
        d = tier_details[tier_name]
        print(f"  {tier_name}: {d['passed']}/{d['total']} passed, "
              f"fraction={d['fraction']}, weighted={d['weighted']}")
    print(f"  Anti-gaming: {reason}")
    print(f"  Total reward: {total_reward}")

    print(total_reward)


if __name__ == "__main__":
    compute()
