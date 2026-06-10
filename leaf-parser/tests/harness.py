#!/usr/bin/env python3
"""Root-side correctness harness for the markdown-html verifier.

Two subcommands, both run by root with `python3 -ISs` (isolated mode, no
site-packages, no env). The agent's converter never runs here.

  stage  — Read the visible (/app/test-suite) and hidden (/tests/hidden_cases)
           case JSONs (root can read /tests; the agent cannot). For each case:
             * write the `markdown` payload to an agent-readable input file in a
               root-owned staging dir (mode 0644),
             * pre-create the per-case output file in a SEPARATE root-owned
               staging dir, mode 0666 — so the agent's md2html can write its
               HTML into it but cannot create siblings or unlink/symlink-swap it
               (the dir itself is root-owned 0755; capture.py-style).
           Emits a run-manifest (agent-readable: "<input>\t<output>") consumed
           by the as-agent runner, and a grade-manifest (root-only) recording
           "<label>\t<output>\t<source-json>" for scoring.

  grade  — Read the grade-manifest. For each case, read the EXPECTED html from
           the source JSON as root, then read the agent-written output with an
           FD-pinned, O_NOFOLLOW open (reject symlinks, non-regular files, and
           nlink>1 hardlinks) and byte-compare. Prints a single stdout line of
           four integers ("vis_pass vis_total hid_pass hid_total"); all human
           logging goes to stderr so the caller can capture the counts cleanly.

This file may read agent-writable output paths (FD-pinned), so it is kept
SEPARATE from compute_reward.py, which must never touch agent-writable paths.
"""
import argparse
import json
import os
import stat
import sys


def _eprint(*a):
    print(*a, file=sys.stderr)


def _iter_cases(cases_dir):
    if not os.path.isdir(cases_dir):
        return
    for name in sorted(os.listdir(cases_dir)):
        if name.startswith("test_") and name.endswith(".json"):
            yield name, os.path.join(cases_dir, name)


def cmd_stage(args):
    os.makedirs(args.inputs_dir, exist_ok=True)
    os.makedirs(args.outputs_dir, exist_ok=True)

    run_lines = []
    grade_lines = []
    counts = {"visible": 0, "hidden": 0}

    for label, cases_dir in (("visible", args.visible_dir),
                             ("hidden", args.hidden_dir)):
        for fname, fpath in _iter_cases(cases_dir):
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    case = json.load(f)
                md = case["markdown"]
            except (OSError, ValueError, KeyError) as e:
                _eprint(f"[stage] skip {label}/{fname}: {e}")
                continue

            key = f"{label}__{fname[:-5]}"          # strip ".json"
            in_path = os.path.join(args.inputs_dir, key + ".md")
            out_path = os.path.join(args.outputs_dir, key + ".out")

            with open(in_path, "wb") as f:
                f.write(md.encode("utf-8"))
            os.chmod(in_path, 0o644)

            # Pre-create the output file 0666 in the root-owned 0755 dir.
            with open(out_path, "wb"):
                pass
            os.chmod(out_path, 0o666)

            run_lines.append(f"{in_path}\t{out_path}")
            grade_lines.append(f"{label}\t{out_path}\t{fpath}")
            counts[label] += 1

    with open(args.run_manifest, "w", encoding="utf-8") as f:
        f.write("\n".join(run_lines) + ("\n" if run_lines else ""))
    os.chmod(args.run_manifest, 0o644)

    with open(args.grade_manifest, "w", encoding="utf-8") as f:
        f.write("\n".join(grade_lines) + ("\n" if grade_lines else ""))

    _eprint(f"[stage] visible={counts['visible']} hidden={counts['hidden']} "
            f"inputs={args.inputs_dir} outputs={args.outputs_dir}")
    print(f"{counts['visible']} {counts['hidden']}")
    return 0


def _read_pinned(path):
    """FD-pinned read: reject symlink/non-regular/hardlinked output files."""
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        st = os.fstat(fd)
        if not stat.S_ISREG(st.st_mode):
            return None
        if st.st_nlink > 1:
            return None
        chunks = []
        while True:
            b = os.read(fd, 1 << 16)
            if not b:
                break
            chunks.append(b)
        return b"".join(chunks)
    finally:
        os.close(fd)


def cmd_grade(args):
    res = {"visible": [0, 0], "hidden": [0, 0]}   # [passed, total]
    failed = []

    try:
        with open(args.grade_manifest, "r", encoding="utf-8") as f:
            lines = [ln.rstrip("\n") for ln in f if ln.strip()]
    except OSError as e:
        _eprint(f"[grade] cannot read grade-manifest: {e}")
        print("0 0 0 0")
        return 1

    for ln in lines:
        parts = ln.split("\t")
        if len(parts) != 3:
            continue
        label, out_path, src_json = parts
        if label not in res:
            continue
        res[label][1] += 1

        try:
            with open(src_json, "r", encoding="utf-8") as f:
                expected = json.load(f)["html"].encode("utf-8")
        except (OSError, ValueError, KeyError) as e:
            _eprint(f"[grade] bad source {src_json}: {e}")
            failed.append(f"[{label}] {os.path.basename(src_json)} (no-expected)")
            continue

        try:
            actual = _read_pinned(out_path)
        except OSError:
            actual = None

        if actual is not None and actual == expected:
            res[label][0] += 1
        else:
            failed.append(f"[{label}] {os.path.basename(src_json)}")

    if args.failed_file:
        try:
            with open(args.failed_file, "w", encoding="utf-8") as f:
                f.write("\n".join(failed) + ("\n" if failed else ""))
        except OSError as e:
            _eprint(f"[grade] cannot write failed-file: {e}")

    vp, vt = res["visible"]
    hp, ht = res["hidden"]
    _eprint(f"[grade] visible={vp}/{vt} hidden={hp}/{ht} failed={len(failed)}")
    print(f"{vp} {vt} {hp} {ht}")
    return 0


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("stage")
    s.add_argument("--visible-dir", required=True)
    s.add_argument("--hidden-dir", required=True)
    s.add_argument("--inputs-dir", required=True)
    s.add_argument("--outputs-dir", required=True)
    s.add_argument("--run-manifest", required=True)
    s.add_argument("--grade-manifest", required=True)
    s.set_defaults(func=cmd_stage)

    g = sub.add_parser("grade")
    g.add_argument("--grade-manifest", required=True)
    g.add_argument("--failed-file", default="")
    g.set_defaults(func=cmd_grade)

    args = ap.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
