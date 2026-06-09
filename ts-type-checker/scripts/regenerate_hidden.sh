#!/bin/bash
#
# AUTHORING-ONLY: regenerate the perturbed hidden corpus + answer key.
#
# Closes the corpus-lookup cheat class (HARBOR anti_cheats.md Defense 7):
#   Step 1+2  ts_perturb.py  — width-preserving identifier rename + a MID-FILE
#                              structural insertion (shifts downstream line nos).
#   Step 3    ts_oracle.js   — re-run the REAL TypeScript compiler on the
#                              perturbed inputs to produce ground-truth
#                              (file,line,col,code,message) diagnostics.
#
# tsc is DELIBERATELY absent from the task image (it must never be agent-
# readable). The oracle therefore runs in a THROWAWAY container with
# `typescript` installed. STRICT_DEFAULT=true matches the TypeScript test
# harness convention that produced the upstream baselines (verified to
# reproduce them at 99.2% exact (line,code) match).
#
# Inputs : an UNPERTURBED corpus of .ts files (the upstream conformance split).
# Outputs: tests/hidden_cases/{test_files/*.ts, hidden_expected.json,
#          hidden_manifest.json}  (committed).
#
# Usage:  scripts/regenerate_hidden.sh <SOURCE_TS_DIR> [SEED] [TS_VERSION]
#   SOURCE_TS_DIR : dir of unperturbed .ts inputs to perturb (e.g. a backup
#                   of the original hidden split).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASK_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HID="$TASK_DIR/tests/hidden_cases"

SRC="${1:?usage: regenerate_hidden.sh <SOURCE_TS_DIR> [SEED] [TS_VERSION]}"
SEED="${2:-0xCAFEBABE}"
TS_VERSION="${3:-5.7.3}"

WORK="$(mktemp -d /tmp/ts_regen_XXXXXX)"
echo "[1/3] Perturbing $(ls "$SRC"/*.ts | wc -l) files (seed=$SEED) ..."
python3 "$SCRIPT_DIR/ts_perturb.py" \
    --in-dir "$SRC" \
    --out-dir "$WORK/perturbed" \
    --seed "$SEED" \
    --report "$WORK/perturb_report.json"

# Carry over category labels from the existing manifest if present.
CATS=""
if [ -f "$HID/hidden_manifest.json" ]; then
    cp "$HID/hidden_manifest.json" "$WORK/cats.json"
    CATS="cats.json"
fi
cp "$SCRIPT_DIR/ts_oracle.js" "$WORK/ts_oracle.js"

echo "[2/3] Oracle re-run (real tsc@$TS_VERSION, strict-default) in throwaway container ..."
docker run --rm -e STRICT_DEFAULT=true -v "$WORK":/work -w /work node:20-slim bash -c "
    npm i -g typescript@$TS_VERSION >/dev/null 2>&1 && \
    export NODE_PATH=\$(npm root -g) && \
    node ts_oracle.js perturbed hidden_expected.json hidden_manifest.json $CATS
"

echo "[3/3] Installing perturbed corpus into $HID ..."
rm -rf "$HID/test_files"
cp -a "$WORK/perturbed" "$HID/test_files"
cp "$WORK/hidden_expected.json" "$HID/hidden_expected.json"
cp "$WORK/hidden_manifest.json" "$HID/hidden_manifest.json"

echo "Done. Files: $(ls "$HID/test_files"/*.ts | wc -l). NEVER ship tsc agent-readable."
echo "Work dir kept for inspection: $WORK"
