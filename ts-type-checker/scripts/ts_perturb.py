#!/usr/bin/env python3
"""Authoring-time hidden-case perturbation for the TypeScript corpus.

Closes the corpus-lookup cheat class (HARBOR anti_cheats.md Defense 7).
Modeled on scripts/sorbet_scripts/_perturb.py from the reference
harbor-type-checker-environments repo, ported to TypeScript syntax.

It applies two mutations to each hidden `.ts` source so the shipped
hidden inputs are NOT byte-identical (nor token-isomorphic) to the
upstream TypeScript conformance/compiler corpus an agent may have
memorised:

  Step 1 — width-preserving identifier rename. Pick 5-10 user-DEFINED
           identifiers (class/interface/type/enum/function/var names) and
           rename each to a random same-length identifier. Skips strings,
           template literals, comments, and a TypeScript keyword/lib.d.ts
           denylist so semantics (and therefore the diagnostic concept)
           are preserved.

  Step 2 — MID-FILE structural insertion. Insert one harmless top-level
           declaration (an unused `type` alias — never itself an error)
           BEFORE a top-level declaration, AFTER the leading directive
           header. This shifts the line numbers of every error below the
           insertion point, defeating the (file, line, code)-tuple replay
           attack. The real `tsc` oracle re-run (scripts/ts_oracle.js)
           captures the new line numbers automatically.

This module does NOT produce the expected diagnostics — Step 3 (oracle
re-run on the perturbed source with the real tsc) is the sole source of
ground truth. A lockstep message rewrite is provided only as a fallback
for offline authoring without tsc.

Determinism: per-case RNG seeded by `case_name + seed`, so two runs on
the same seed produce byte-identical output (sibling-task stability).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import re
import sys
from typing import Dict, List, Optional, Set, Tuple


# ---------------------------------------------------------------------------
# Denylist: identifiers TypeScript treats structurally or that name
# built-ins / lib.d.ts globals. These must NEVER be renamed — renaming
# them would change the diagnostic concept (or break parsing).
# ---------------------------------------------------------------------------
TS_DENYLIST: Set[str] = {
    # Reserved words + contextual keywords
    "abstract", "any", "as", "asserts", "assert", "async", "await",
    "boolean", "break", "case", "catch", "class", "const", "continue",
    "debugger", "declare", "default", "delete", "do", "else", "enum",
    "export", "extends", "false", "finally", "for", "from", "function",
    "get", "if", "implements", "import", "in", "infer", "instanceof",
    "interface", "is", "keyof", "let", "module", "namespace", "never",
    "new", "null", "number", "object", "of", "out", "override", "package",
    "private", "protected", "public", "readonly", "require", "return",
    "satisfies", "set", "static", "string", "super", "switch", "symbol",
    "this", "throw", "true", "try", "type", "typeof", "undefined",
    "unique", "unknown", "var", "void", "while", "with", "yield",
    "bigint", "global", "intrinsic", "accessor", "using",
    # Utility types special-cased by name
    "Partial", "Required", "Readonly", "Record", "Pick", "Omit",
    "Exclude", "Extract", "NonNullable", "ReturnType", "Parameters",
    "InstanceType", "ConstructorParameters", "ThisParameterType",
    "OmitThisParameter", "ThisType", "Awaited", "NoInfer", "Uppercase",
    "Lowercase", "Capitalize", "Uncapitalize",
    # Core lib.d.ts globals / built-in constructors
    "Array", "ReadonlyArray", "Object", "Function", "String", "Number",
    "Boolean", "BigInt", "Symbol", "Math", "JSON", "Date", "RegExp",
    "Error", "EvalError", "RangeError", "ReferenceError", "SyntaxError",
    "TypeError", "URIError", "AggregateError", "Promise", "PromiseLike",
    "Proxy", "Reflect", "Map", "Set", "WeakMap", "WeakSet", "WeakRef",
    "FinalizationRegistry", "ArrayBuffer", "SharedArrayBuffer", "DataView",
    "Atomics", "Int8Array", "Uint8Array", "Uint8ClampedArray",
    "Int16Array", "Uint16Array", "Int32Array", "Uint32Array",
    "Float32Array", "Float64Array", "BigInt64Array", "BigUint64Array",
    "Intl", "WebAssembly", "Iterable", "Iterator", "IterableIterator",
    "AsyncIterable", "AsyncIterator", "AsyncIterableIterator", "Generator",
    "AsyncGenerator", "GeneratorFunction", "AsyncGeneratorFunction",
    "ArrayLike", "TemplateStringsArray", "PropertyKey", "PropertyDescriptor",
    "TypedPropertyDescriptor",
    # Common runtime globals
    "console", "globalThis", "NaN", "Infinity", "arguments", "eval",
    "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURI",
    "decodeURI", "encodeURIComponent", "decodeURIComponent",
    "setTimeout", "setInterval", "clearTimeout", "clearInterval",
    "queueMicrotask", "structuredClone", "atob", "btoa",
    "module", "exports", "process", "Buffer", "__dirname", "__filename",
    # Frequently-referenced members / props (renaming these breaks calls)
    "prototype", "constructor", "length", "name", "value", "key",
    "toString", "valueOf", "hasOwnProperty", "call", "apply", "bind",
}


# A TypeScript identifier: starts with letter/underscore/$, continues with
# alnum/underscore/$. Bracketed by non-identifier chars.
_IDENT_RE = re.compile(r"(?<![A-Za-z0-9_$])([A-Za-z_$][A-Za-z0-9_$]*)(?![A-Za-z0-9_$])")

# Definition-site patterns: restrict rename candidates to names DEFINED in
# this file so we never rewrite an external/global reference.
_DEF_PATTERNS = [
    re.compile(r"\b(?:abstract\s+)?class\s+([A-Za-z_$][A-Za-z0-9_$]*)"),
    re.compile(r"\binterface\s+([A-Za-z_$][A-Za-z0-9_$]*)"),
    re.compile(r"\btype\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*[<=]"),
    re.compile(r"\b(?:const\s+)?enum\s+([A-Za-z_$][A-Za-z0-9_$]*)"),
    re.compile(r"\bfunction\s*\*?\s*([A-Za-z_$][A-Za-z0-9_$]*)"),
    re.compile(r"\bnamespace\s+([A-Za-z_$][A-Za-z0-9_$]*)"),
    re.compile(r"\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*[:=;]"),
]

# Top-level declaration start (column 0). Used to find safe interior
# insertion points for Step 2.
_TOPLEVEL_DECL_RE = re.compile(
    r"^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?"
    r"(?:const\s+)?(?:class|interface|type|enum|function|namespace|"
    r"module|const|let|var)\b"
)

class PerturbationFailed(Exception):
    """Raised when a case cannot be perturbed (no renamable identifiers)."""


def _scan_interpolation_end(source: str, brace_idx: int) -> int:
    """Given index of the `{` opening a `${...}`, return the index just
    after the matching `}`. Skips nested strings/templates/comments so a
    brace inside a literal doesn't miscount depth."""
    n = len(source)
    i = brace_idx + 1
    depth = 1
    while i < n and depth > 0:
        c = source[i]
        if c == "\\":
            i += 2
            continue
        if c == "{":
            depth += 1
            i += 1
        elif c == "}":
            depth -= 1
            i += 1
        elif c in ("'", '"'):
            q = c
            i += 1
            while i < n:
                if source[i] == "\\":
                    i += 2
                    continue
                if source[i] == q:
                    i += 1
                    break
                i += 1
        elif c == "`":
            i = _scan_template_end(source, i)
        elif source[i:i + 2] == "//":
            j = source.find("\n", i)
            i = n if j == -1 else j
        elif source[i:i + 2] == "/*":
            j = source.find("*/", i)
            i = n if j == -1 else j + 2
        else:
            i += 1
    return i


def _scan_template_end(source: str, backtick_idx: int) -> int:
    """Return index just after the closing backtick of a template literal
    starting at `backtick_idx` (skipping nested `${...}`)."""
    n = len(source)
    i = backtick_idx + 1
    while i < n:
        c = source[i]
        if c == "\\":
            i += 2
            continue
        if c == "`":
            return i + 1
        if source[i:i + 2] == "${":
            i = _scan_interpolation_end(source, i + 1)
            continue
        i += 1
    return n


def _skip_spans(source: str) -> List[Tuple[int, int]]:
    """Spans that must NOT be renamed: comments, single/double-quoted
    strings, and the TEXT portions of template literals. Crucially, the
    `${...}` interpolations inside template literals are CODE and are NOT
    skipped (identifiers there must rename consistently)."""
    spans: List[Tuple[int, int]] = []
    n = len(source)
    i = 0
    while i < n:
        c = source[i]
        two = source[i:i + 2]
        if two == "//":
            j = source.find("\n", i)
            end = n if j == -1 else j
            spans.append((i, end))
            i = end
        elif two == "/*":
            j = source.find("*/", i)
            end = n if j == -1 else j + 2
            spans.append((i, end))
            i = end
        elif c in ("'", '"'):
            q = c
            j = i + 1
            while j < n:
                if source[j] == "\\":
                    j += 2
                    continue
                if source[j] == q:
                    j += 1
                    break
                j += 1
            spans.append((i, j))
            i = j
        elif c == "`":
            # Template: skip text chunks, but leave ${...} interpolations.
            j = i + 1
            text_start = j
            while j < n:
                if source[j] == "\\":
                    j += 2
                    continue
                if source[j] == "`":
                    spans.append((text_start, j))
                    j += 1
                    break
                if source[j:j + 2] == "${":
                    spans.append((text_start, j))
                    j = _scan_interpolation_end(source, j + 1)
                    text_start = j
                    continue
                j += 1
            else:
                spans.append((text_start, n))
            i = j
        else:
            i += 1
    return spans


def _in_any_span(pos: int, spans: List[Tuple[int, int]]) -> bool:
    for s, e in spans:
        if s <= pos < e:
            return True
    return False


def _random_ident(rng: random.Random, length: int, used: Set[str]) -> str:
    """Generate a fresh identifier of EXACT `length`."""
    if length < 1:
        return ""
    first = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_"
    rest = first + "0123456789"
    for _ in range(500):
        s = rng.choice(first) + "".join(rng.choices(rest, k=length - 1))
        if s not in used and s not in TS_DENYLIST:
            return s
    raise RuntimeError(f"could not generate fresh identifier of length {length}")


def _collect_renamable(source: str) -> Dict[str, int]:
    """Return {defined_name: code_occurrence_count} for this file."""
    spans = _skip_spans(source)
    defined: Set[str] = set()
    for pat in _DEF_PATTERNS:
        for m in pat.finditer(source):
            if _in_any_span(m.start(1), spans):
                continue
            name = m.group(1)
            if name in TS_DENYLIST or len(name) < 3:
                continue
            defined.add(name)
    if not defined:
        return {}
    counts: Dict[str, int] = {n: 0 for n in defined}
    for m in _IDENT_RE.finditer(source):
        name = m.group(1)
        if name not in defined:
            continue
        if _in_any_span(m.start(), spans):
            continue
        counts[name] += 1
    return {k: v for k, v in counts.items() if v > 0}


def _apply_rename(source: str, rename_map: Dict[str, str]) -> str:
    if not rename_map:
        return source
    spans = _skip_spans(source)
    pattern = re.compile(
        r"(?<![A-Za-z0-9_$])("
        + "|".join(re.escape(k) for k in rename_map)
        + r")(?![A-Za-z0-9_$])"
    )

    def repl(m: re.Match) -> str:
        if _in_any_span(m.start(), spans):
            return m.group(0)
        return rename_map[m.group(1)]

    return pattern.sub(repl, source)


def _dominant_eol(source: str) -> str:
    return "\r\n" if source.count("\r\n") >= source.count("\n") - source.count("\r\n") else "\n"


def _interior_insertion_index(lines: List[str]) -> Optional[int]:
    """0-based index of a line to insert BEFORE.

    Safe spot: a column-0 top-level declaration that is not line 0 and
    whose previous non-blank line is also at column 0 (so we are not
    inside an indented block). Choose the EARLIEST such spot so the
    insertion shifts the maximum number of downstream error lines.
    """
    for idx in range(1, len(lines)):
        line = lines[idx].rstrip("\r\n")
        if not _TOPLEVEL_DECL_RE.match(line):
            continue
        j = idx - 1
        while j >= 0 and not lines[j].strip():
            j -= 1
        if j < 0:
            continue
        prev = lines[j]
        if prev[:1] in (" ", "\t"):
            continue
        return idx
    return None


def perturb_source(
    source: str, case_name: str, seed: int
) -> Tuple[str, Dict[str, str], Optional[str]]:
    """Return (new_source, rename_map, stub_name). Raises PerturbationFailed."""
    digest = hashlib.sha256(f"{case_name}:{seed}".encode()).digest()
    rng = random.Random(int.from_bytes(digest[:8], "big"))

    counts = _collect_renamable(source)
    candidates = sorted(counts.keys())
    if not candidates:
        raise PerturbationFailed("no renamable identifiers")

    rng.shuffle(candidates)
    n_rename = min(rng.randint(5, 10), len(candidates))
    to_rename = candidates[:n_rename]

    used: Set[str] = set(candidates) | TS_DENYLIST
    rename_map: Dict[str, str] = {}
    for old in to_rename:
        new = _random_ident(rng, len(old), used)
        rename_map[old] = new
        used.add(new)

    new_source = _apply_rename(source, rename_map)

    # Step 2 — mid-file structural insertion (unused top-level type alias).
    eol = _dominant_eol(new_source)
    stub_name = _random_ident(rng, 12, used)
    used.add(stub_name)
    stub = f"type {stub_name} = number;{eol}"

    lines = new_source.splitlines(keepends=True)
    idx = _interior_insertion_index(lines)
    if idx is None:
        # Fallback: append at EOF (still structural; weaker line-shift).
        if new_source and not new_source.endswith(("\n", "\r")):
            new_source += eol
        new_source += stub
    else:
        lines.insert(idx, stub)
        new_source = "".join(lines)

    return new_source, rename_map, stub_name


def lockstep_rewrite_message(msg: str, rename_map: Dict[str, str]) -> str:
    """Fallback only: rewrite identifiers in an expected message_substr
    when the tsc oracle is unavailable on the authoring host. Preferred
    path is the oracle re-run, which produces messages directly."""
    if not msg or not rename_map:
        return msg
    pattern = re.compile(
        r"(?<![A-Za-z0-9_$])("
        + "|".join(re.escape(k) for k in rename_map)
        + r")(?![A-Za-z0-9_$])"
    )
    return pattern.sub(lambda m: rename_map[m.group(1)], msg)


def main() -> int:
    ap = argparse.ArgumentParser(description="Perturb TS hidden-case sources.")
    ap.add_argument("--in-dir", required=True, help="Directory of source .ts files")
    ap.add_argument("--out-dir", required=True, help="Where to write perturbed .ts")
    ap.add_argument("--seed", default="0xCAFEBABE", help="Global perturbation seed")
    ap.add_argument("--report", default="", help="Optional JSON report path")
    args = ap.parse_args()

    seed = int(args.seed, 0) if args.seed.lower().startswith("0x") else int(args.seed)
    os.makedirs(args.out_dir, exist_ok=True)

    report: Dict[str, dict] = {}
    dropped: List[str] = []
    files = sorted(f for f in os.listdir(args.in_dir) if f.endswith(".ts"))
    for fname in files:
        name = fname[:-3]
        with open(os.path.join(args.in_dir, fname), "r", errors="replace") as fh:
            src = fh.read()
        try:
            new_src, rmap, stub = perturb_source(src, name, seed)
        except PerturbationFailed as e:
            # Degenerate case: keep it but only insert the structural stub
            # so it is still NOT byte-identical to upstream.
            eol = _dominant_eol(src)
            lines = src.splitlines(keepends=True)
            digest = hashlib.sha256(f"{name}:{seed}:stub".encode()).digest()
            rng = random.Random(int.from_bytes(digest[:8], "big"))
            stub_name = _random_ident(rng, 12, set(TS_DENYLIST))
            stub = f"type {stub_name} = number;{eol}"
            idx = _interior_insertion_index(lines)
            if idx is None:
                if src and not src.endswith(("\n", "\r")):
                    src += eol
                new_src = src + stub
            else:
                lines.insert(idx, stub)
                new_src = "".join(lines)
            rmap = {}
            report[name] = {"rename_count": 0, "stub_name": stub_name,
                            "note": f"rename_skipped:{e}"}
            dropped.append(name)
        else:
            report[name] = {"rename_count": len(rmap), "stub_name": stub,
                            "renamed": rmap}
        if new_src == src:
            print(f"WARNING: {name} unchanged after perturbation", file=sys.stderr)
        with open(os.path.join(args.out_dir, fname), "w") as fh:
            fh.write(new_src)

    if args.report:
        with open(args.report, "w") as fh:
            json.dump({"cases": report, "rename_skipped": dropped}, fh, indent=2)

    print(f"Perturbed {len(files)} files -> {args.out_dir} "
          f"({len(dropped)} with rename skipped)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
