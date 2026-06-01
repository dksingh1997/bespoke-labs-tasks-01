#!/usr/bin/env python3
"""
Build script for ts-type-checker environment.
Curates test files from the TypeScript repo and generates expected error data.
Splits into visible (agent-accessible) and hidden (verifier-only) sets.

Split strategy: error-code-aware. Every error code that appears in the hidden
set is guaranteed to also appear in at least one visible test.
"""

import os
import re
import json
import random
import shutil
from collections import Counter, defaultdict

TS_REPO = "/tmp/ts-repo"
BASELINES_DIR = os.path.join(TS_REPO, "tests/baselines/reference")
COMPILER_DIR = os.path.join(TS_REPO, "tests/cases/compiler")
CONFORMANCE_DIR = os.path.join(TS_REPO, "tests/cases/conformance")

MAX_COMPILER_TESTS = 500
VISIBLE_FRACTION = 0.5

EXCLUDE_DIRECTIVES = {
    "filename", "jsx", "jsxfactory", "jsximportssource",
    "outdir", "outfile", "declaration", "declarationmap",
    "sourcemap", "inlinesourcemap", "isolatedmodules", "importhelpers",
    "moduleresolution", "resolvejsonmodule", "allowjs", "checkjs",
    "baseurl", "paths", "rootdir", "rootdirs", "composite", "incremental",
    "tsbuildinfofile", "moduledetection", "emitdecoratormetadata",
    "experimentaldecorators", "preserveconstenums", "verbatimmodulesyntax",
    "module",
    "nocheck", "listfilesonly", "listfiles", "noimplicitreferences",
    "typeroots", "types", "traceresolution", "noerrortruncation",
    "currentdirectory", "noresolve",
}

EXCLUDE_CONF_DIRS = {
    "declarationEmit", "emitter", "jsx", "jsdoc", "salsa",
    "moduleResolution", "node", "externalModules", "internalModules",
    "dynamicImport", "references", "nonjsExtensions", "directives",
    "importAttributes", "importAssertion", "importDefer",
    "esDecorators", "decorators",
    "parser", "scanner",
}


def get_content(filepath):
    with open(filepath, "r", errors="replace") as f:
        content = f.read()
    if content.startswith("\ufeff"):
        content = content[1:]
    content = content.replace("\r\n", "\n").replace("\r", "\n")
    return content


def parse_directives(content):
    directives = {}
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("// @") or stripped.startswith("//@"):
            m = re.match(r"^//\s*@(\w+):\s*(.+)$", stripped)
            if m:
                directives[m.group(1).lower()] = m.group(2).strip()
        elif not stripped.startswith("//"):
            break
    return directives


def should_include(filepath, content, directives):
    for d in directives:
        if d in EXCLUDE_DIRECTIVES:
            return False
    if re.search(r"^//\s*@filename:", content, re.MULTILINE | re.IGNORECASE):
        return False
    if re.search(r"^import\s", content, re.MULTILINE):
        return False
    if filepath.endswith(".tsx"):
        return False
    if "/// <reference" in content:
        return False
    return True


def count_header_lines(content):
    count = 0
    for line in content.split("\n"):
        stripped = line.strip()
        if stripped.startswith("// @") or stripped.startswith("//@"):
            count += 1
        elif stripped == "":
            count += 1
        else:
            break
    return count


def parse_errors_baseline(test_name, offset):
    """Extract errors from .errors.txt baseline, adjusting line numbers.
    Now also captures the full error message."""
    errors_file = os.path.join(BASELINES_DIR, test_name + ".errors.txt")
    if not os.path.exists(errors_file):
        return []

    errors = []
    with open(errors_file, "r", errors="replace") as f:
        for line in f:
            m = re.match(
                r"^(\S+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)$",
                line.strip(),
            )
            if m:
                errors.append({
                    "line": int(m.group(2)) + offset,
                    "col": int(m.group(3)),
                    "code": m.group(4),
                    "message": m.group(5),
                })
    return errors


def try_process(filepath, category):
    fname = os.path.basename(filepath)
    test_name = os.path.splitext(fname)[0]

    content = get_content(filepath)
    directives = parse_directives(content)

    if not should_include(filepath, content, directives):
        return None

    types_baseline = os.path.join(BASELINES_DIR, test_name + ".types")
    if not os.path.exists(types_baseline):
        return None

    offset = count_header_lines(content)
    errors = parse_errors_baseline(test_name, offset)

    error_codes = set(e["code"] for e in errors)

    return {
        "name": test_name,
        "file": fname,
        "filepath": filepath,
        "category": category,
        "num_errors": len(errors),
        "errors": errors,
        "error_codes": error_codes,
    }


def error_code_aware_split(tests, visible_fraction, seed=42):
    """Split tests into visible/hidden ensuring every error code in hidden
    also appears in at least one visible test.

    Algorithm:
    1. Do an initial category-stratified 50/50 split.
    2. Find error codes that appear in hidden but not visible.
    3. For each such code, move one test containing it from hidden to visible
       (swapping with a visible test from the same category if possible).
    """
    rng = random.Random(seed)

    by_cat = defaultdict(list)
    for t in tests:
        by_cat[t["category"]].append(t)

    visible, hidden = [], []
    visible_set = set()
    hidden_set = set()

    for cat in sorted(by_cat.keys()):
        cat_tests = by_cat[cat]
        rng.shuffle(cat_tests)
        n_visible = max(1, int(len(cat_tests) * visible_fraction))
        for t in cat_tests[:n_visible]:
            visible.append(t)
            visible_set.add(t["name"])
        for t in cat_tests[n_visible:]:
            hidden.append(t)
            hidden_set.add(t["name"])

    # Collect error codes per set
    visible_codes = set()
    for t in visible:
        visible_codes.update(t["error_codes"])

    hidden_codes = set()
    for t in hidden:
        hidden_codes.update(t["error_codes"])

    missing_codes = hidden_codes - visible_codes
    print(f"  Initial split: {len(visible)} visible, {len(hidden)} hidden")
    print(f"  Error codes: {len(visible_codes)} visible, {len(hidden_codes)} hidden")
    print(f"  Codes in hidden but not visible: {len(missing_codes)}")

    # For each missing code, find a hidden test that has it and move to visible
    moves = 0
    for code in sorted(missing_codes):
        # Find a hidden test with this code
        donor = None
        for t in hidden:
            if code in t["error_codes"] and t["name"] in hidden_set:
                donor = t
                break
        if not donor:
            continue

        # Move donor from hidden to visible
        hidden_set.discard(donor["name"])
        visible_set.add(donor["name"])
        hidden.remove(donor)
        visible.append(donor)
        visible_codes.update(donor["error_codes"])
        moves += 1

    print(f"  Moved {moves} tests from hidden to visible for code coverage")

    # Re-check
    hidden_codes_after = set()
    for t in hidden:
        hidden_codes_after.update(t["error_codes"])
    still_missing = hidden_codes_after - visible_codes
    print(f"  After fix: {len(visible)} visible, {len(hidden)} hidden")
    print(f"  Still missing codes: {len(still_missing)}")

    return visible, hidden


def write_visible(tests, out_dir):
    """Write visible tests: .ts files + .errors files with full messages."""
    os.makedirs(out_dir, exist_ok=True)

    for t in tests:
        dest = os.path.join(out_dir, t["file"])
        shutil.copy2(t["filepath"], dest)

        errors_file = os.path.join(out_dir, t["name"] + ".errors")
        if t["errors"]:
            lines = []
            for e in t["errors"]:
                lines.append(
                    f"{t['file']}({e['line']},{e['col']}): error {e['code']}: {e['message']}"
                )
            with open(errors_file, "w") as f:
                f.write("\n".join(lines) + "\n")
        else:
            with open(errors_file, "w") as f:
                f.write("")


def write_hidden(tests, out_dir):
    """Write hidden tests: .ts files in test_files/, plus expected JSON and manifest."""
    test_files_dir = os.path.join(out_dir, "test_files")
    os.makedirs(test_files_dir, exist_ok=True)

    expected = {}
    manifest = []

    for t in tests:
        dest = os.path.join(test_files_dir, t["file"])
        shutil.copy2(t["filepath"], dest)
        manifest.append({
            "name": t["name"],
            "file": t["file"],
            "category": t["category"],
            "num_errors": t["num_errors"],
        })
        expected[t["name"]] = [
            {"line": e["line"], "col": e["col"], "code": e["code"]}
            for e in t["errors"]
        ]

    with open(os.path.join(out_dir, "hidden_expected.json"), "w") as f:
        json.dump(expected, f)
    with open(os.path.join(out_dir, "hidden_manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    return expected, manifest


def main():
    print("Collecting tests from TypeScript repo...\n")

    compiler_candidates = []
    for fname in sorted(os.listdir(COMPILER_DIR)):
        if fname.endswith(".ts") and not fname.endswith(".d.ts"):
            result = try_process(os.path.join(COMPILER_DIR, fname), "compiler")
            if result:
                compiler_candidates.append(result)

    random.seed(42)
    if len(compiler_candidates) > MAX_COMPILER_TESTS:
        compiler_tests = random.sample(compiler_candidates, MAX_COMPILER_TESTS)
    else:
        compiler_tests = compiler_candidates

    print(f"Compiler: {len(compiler_tests)} selected from {len(compiler_candidates)} eligible")

    conformance_tests = []
    for root, dirs, files in os.walk(CONFORMANCE_DIR):
        rel = os.path.relpath(root, CONFORMANCE_DIR)
        top_dir = rel.split("/")[0]
        if top_dir in EXCLUDE_CONF_DIRS:
            continue
        for fname in sorted(files):
            if fname.endswith(".ts") and not fname.endswith(".d.ts"):
                category = f"conformance/{top_dir}" if top_dir != "." else "conformance"
                result = try_process(os.path.join(root, fname), category)
                if result:
                    conformance_tests.append(result)

    print(f"Conformance: {len(conformance_tests)} tests")

    all_tests = compiler_tests + conformance_tests

    seen = set()
    deduped = []
    for t in all_tests:
        if t["name"] not in seen:
            seen.add(t["name"])
            deduped.append(t)
    all_tests = deduped

    print(f"\nTotal deduplicated: {len(all_tests)} tests")

    # Error-code-aware split
    print("\nSplitting with error code coverage guarantee...")
    visible_tests, hidden_tests = error_code_aware_split(
        all_tests, VISIBLE_FRACTION, seed=42
    )

    # Print stats
    for label, tests in [("Visible", visible_tests), ("Hidden", hidden_tests)]:
        with_errors = sum(1 for t in tests if t["num_errors"] > 0)
        no_errors = sum(1 for t in tests if t["num_errors"] == 0)
        total_instances = sum(t["num_errors"] for t in tests)
        all_codes = set()
        for t in tests:
            all_codes.update(t["error_codes"])
        print(f"\n{label}: {len(tests)} tests")
        print(f"  With errors: {with_errors}")
        print(f"  Without errors: {no_errors}")
        print(f"  Total error instances: {total_instances}")
        print(f"  Unique error codes: {len(all_codes)}")

        cats = Counter(t["category"] for t in tests)
        print(f"  Categories: {len(cats)}")
        for cat, cnt in cats.most_common(10):
            print(f"    {cnt:5d}  {cat}")

    return visible_tests, hidden_tests


if __name__ == "__main__":
    visible, hidden = main()
    print("\nDone. Use write_visible() and write_hidden() to output files.")
