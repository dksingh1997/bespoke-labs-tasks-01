#!/usr/bin/env python3
"""Standalone scorer for the ts-type-checker verifier (HARBOR Phase 4).

Invoked by test.sh as `python3 -ISs compute_reward.py ...` (isolated mode:
no site-packages, no env, no user paths). It runs OUTSIDE the strace window
as root and reads ONLY root-owned files (the checker's captured stdout under
/logs/verifier and the answer keys under /tests). It NEVER imports or executes
anything from /app, and imports only the stdlib.

Scoring (HARBOR anti_cheats.md M1/M2 + multiplicative reward):
  * Canary gate — every canary file must match EXACTLY (per (line, code),
    no false positives / negatives). <100% => reward 0.0.
  * Hidden — per-file AND-match on (file, line, kind) AND code AND
    message_substr (port of case_runner_verifier.py). A file passes only if
    every expected diagnostic is matched AND there are no extra diagnostics.
  * Reward = id_rate * non_id_rate (port of compute_reward.py). Identity
    cases (0 expected errors) test "no spurious errors on clean code";
    non-identity cases test "correct errors on broken code". A no-op checker
    passes all identity (rate 1.0) but no non-identity (rate 0.0) => 0.0.

Output reward.json / reward.txt are written ATOMICALLY via os.replace().
"""

import argparse
import json
import os
import re
import tempfile
from collections import Counter


# Two accepted diagnostic line shapes. Group order: file, line, col, code, msg.
_RE_PAREN = re.compile(r"^(.+?\.ts)\((\d+),(\d+)\):\s*error\s+(TS\d+)\s*:?\s*(.*)$")
_RE_COLON = re.compile(r"^(.+?\.ts):(\d+):(\d+)\s*-?\s*error\s+(TS\d+)\s*:?\s*(.*)$")


def parse_checker_output(path):
    """Parse checker stdout into {basename: [ {file,line,col,code,kind,message} ]}."""
    by_file = {}
    try:
        with open(path, "r", errors="replace") as fh:
            for line in fh:
                s = line.rstrip("\r\n").strip()
                if not s:
                    continue
                m = _RE_PAREN.match(s) or _RE_COLON.match(s)
                if not m:
                    continue
                fname = os.path.basename(m.group(1))
                by_file.setdefault(fname, []).append({
                    "file": fname,
                    "line": int(m.group(2)),
                    "col": int(m.group(3)),
                    "code": m.group(4),
                    "kind": "error",
                    "message": m.group(5),
                })
    except FileNotFoundError:
        pass
    return by_file


def _matches(actual, expected, require_message):
    """AND-match a single actual diagnostic against an expected one."""
    if actual["file"] != expected.get("file", actual["file"]):
        return False
    if actual["line"] != expected.get("line"):
        return False
    if expected.get("kind", "error") != actual.get("kind", "error"):
        return False
    exp_code = expected.get("code")
    if exp_code is not None and actual.get("code") != exp_code:
        return False
    if require_message:
        es = expected.get("message")
        if es:
            am = actual.get("message", "")
            if not (isinstance(am, str) and es in am):
                return False
    return True


def file_passes(actuals, expecteds, require_message):
    """Greedy multiset AND-match. Pass iff every expected is matched AND
    there are no extra actual diagnostics."""
    used = set()
    unmatched = []
    for exp in expecteds:
        hit = False
        for i, act in enumerate(actuals):
            if i in used:
                continue
            if _matches(act, exp, require_message):
                used.add(i)
                hit = True
                break
        if not hit:
            unmatched.append(exp)
    extras = [a for i, a in enumerate(actuals) if i not in used]
    return (not unmatched and not extras), unmatched, extras


def write_atomic(path, payload):
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, prefix=".reward.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as fh:
            fh.write(payload)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def write_reward(outdir, score, subscores, **additional):
    score = max(0.0, min(1.0, round(float(score), 6)))
    payload = {
        "score": score,
        "reward": score,
        "subscores": subscores,
        "additional_data": additional,
    }
    os.makedirs(outdir, exist_ok=True)
    write_atomic(os.path.join(outdir, "reward.json"), json.dumps(payload, indent=2))
    write_atomic(os.path.join(outdir, "reward.txt"), str(score))
    print(f"Reward: {score}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output-dir", required=True)
    ap.add_argument("--canary-output")
    ap.add_argument("--canary-expected")
    ap.add_argument("--hidden-output")
    ap.add_argument("--hidden-expected")
    ap.add_argument("--hidden-manifest")
    ap.add_argument("--checker-ms", type=int, default=0)
    ap.add_argument("--fail", help="Hard-failure reason (forces score 0)")
    ap.add_argument("--detail", default="")
    args = ap.parse_args()

    if args.fail:
        write_reward(
            args.output_dir, 0.0,
            subscores=[{"subtask": "id_rate", "score": 0.0},
                       {"subtask": "non_id_rate", "score": 0.0}],
            error=args.fail, error_detail=args.detail,
            total_time_ms=args.checker_ms, checker_time_ms=args.checker_ms,
            canary_gate={"status": "skipped"},
            hidden_tests={"passed": 0, "total": 0},
        )
        return

    # ---- Canary gate (must be exact 100%; matches on (line, code)) ----
    with open(args.canary_expected) as fh:
        canary_expected = json.load(fh)
    canary_actual = parse_checker_output(args.canary_output)

    c_passed = 0
    c_total = len(canary_expected)
    canary_results = []
    for name, errs in sorted(canary_expected.items()):
        fname = name + ".ts"
        expecteds = [dict(e, file=fname, kind=e.get("kind", "error")) for e in errs]
        actuals = canary_actual.get(fname, [])
        ok, unmatched, extras = file_passes(actuals, expecteds, require_message=False)
        if ok:
            c_passed += 1
            canary_results.append({"test": fname, "passed": True})
        else:
            canary_results.append({
                "test": fname, "passed": False,
                "expected": [(e["line"], e["code"]) for e in expecteds],
                "actual": [(a["line"], a["code"]) for a in actuals],
                "missed": [(e["line"], e.get("code")) for e in unmatched],
                "false_positives": [(a["line"], a["code"]) for a in extras],
            })
            print(f"  CANARY FAIL {fname}: "
                  f"missed={[(e['line'], e.get('code')) for e in unmatched]} "
                  f"fp={[(a['line'], a['code']) for a in extras]}")

    print(f"Canary: {c_passed}/{c_total}")
    if c_passed != c_total:
        print("CANARY GATE: FAILED — awarding 0.")
        write_reward(
            args.output_dir, 0.0,
            subscores=[{"subtask": "id_rate", "score": 0.0},
                       {"subtask": "non_id_rate", "score": 0.0}],
            error="canary_gate_failed",
            error_detail=f"Canary gate requires 100% pass; got {c_passed}/{c_total}.",
            total_time_ms=args.checker_ms, checker_time_ms=args.checker_ms,
            canary_gate={"status": "failed", "passed": c_passed,
                         "total": c_total, "results": canary_results},
            hidden_tests={"passed": 0, "total": 0},
        )
        return
    print("CANARY GATE: PASSED\n")

    canary_gate = {"status": "passed", "passed": c_passed, "total": c_total}

    # ---- Hidden tests (AND-match + multiplicative) ----
    with open(args.hidden_expected) as fh:
        hidden_expected = json.load(fh)
    with open(args.hidden_manifest) as fh:
        manifest = json.load(fh)
    hidden_actual = parse_checker_output(args.hidden_output)

    id_pass = id_total = nonid_pass = nonid_total = 0
    cat_pass = Counter()
    cat_total = Counter()
    subscore_detail = []

    for test in manifest:
        name = test["name"]
        fname = test.get("file", name + ".ts")
        cat = test.get("category", "unknown")
        expecteds = hidden_expected.get(name, [])
        expecteds = [dict(e, file=e.get("file", fname),
                          kind=e.get("kind", "error")) for e in expecteds]
        actuals = hidden_actual.get(fname, [])
        ok, unmatched, extras = file_passes(actuals, expecteds, require_message=True)

        is_identity = len(expecteds) == 0
        cat_total[cat] += 1
        if is_identity:
            id_total += 1
            if ok:
                id_pass += 1
                cat_pass[cat] += 1
        else:
            nonid_total += 1
            if ok:
                nonid_pass += 1
                cat_pass[cat] += 1

    id_rate = (id_pass / id_total) if id_total > 0 else 1.0
    non_id_rate = (nonid_pass / nonid_total) if nonid_total > 0 else 1.0
    if id_total == 0 and nonid_total == 0:
        score = 0.0
    else:
        score = id_rate * non_id_rate

    print(f"Identity (clean) cases:     {id_pass}/{id_total} "
          f"(rate {id_rate:.4f})")
    print(f"Non-identity (error) cases: {nonid_pass}/{nonid_total} "
          f"(rate {non_id_rate:.4f})")
    print(f"Score = {id_rate:.4f} * {non_id_rate:.4f} = {score:.4f}")

    category_summary = {}
    for cat in sorted(cat_total):
        p, t = cat_pass[cat], cat_total[cat]
        category_summary[cat] = {"passed": p, "total": t,
                                 "pass_rate": round(p / t, 4) if t else 0.0}

    write_reward(
        args.output_dir, score,
        subscores=[{"subtask": "id_rate", "score": round(id_rate, 6)},
                   {"subtask": "non_id_rate", "score": round(non_id_rate, 6)}],
        total_time_ms=args.checker_ms, checker_time_ms=args.checker_ms,
        canary_gate=canary_gate,
        hidden_tests={"passed": id_pass + nonid_pass,
                      "total": id_total + nonid_total},
        id_passed=id_pass, id_total=id_total,
        non_id_passed=nonid_pass, non_id_total=nonid_total,
        category_summary=category_summary,
    )


if __name__ == "__main__":
    main()
