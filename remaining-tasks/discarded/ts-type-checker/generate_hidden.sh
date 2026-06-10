#!/bin/bash
#
# One-time script: clones the TypeScript repo, runs build_tests.py to curate
# and split tests, then extracts all pre-computed assets into the repo.
#
# Run this whenever you want to regenerate the test data (e.g. new TS version,
# changed filtering logic in build_tests.py).
#
# After running, commit the updated files under environment/ and tests/.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

VISIBLE_OUT="$SCRIPT_DIR/environment/visible_tests"
HIDDEN_OUT="$SCRIPT_DIR/tests/hidden_cases"
LIB_OUT="$SCRIPT_DIR/environment/lib"
CHECKSUMS_OUT="$SCRIPT_DIR/environment/checksums"

TS_VERSION="${TS_VERSION:-5.7.3}"

echo "=== Building test generator ==="

# Use a temporary Dockerfile that clones TS repo and runs build_tests.py
TMPDIR=$(mktemp -d)
cat > "$TMPDIR/Dockerfile" << 'GENEOF'
FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git python3 && rm -rf /var/lib/apt/lists/*

ARG TS_VERSION=5.7.3
WORKDIR /tmp/ts-build

RUN git clone --depth 1 --branch v${TS_VERSION} https://github.com/microsoft/TypeScript.git /tmp/ts-repo

COPY build_tests.py /tmp/build_tests.py
RUN python3 /tmp/build_tests.py

RUN mkdir -p /app/tests /app/lib && \
    cp -r /tmp/visible_tests/* /app/tests/ && \
    cp /tmp/visible_expected.json /app/tests/expected.json && \
    cp /tmp/visible_manifest.json /app/tests/manifest.json

RUN cp /tmp/ts-repo/lib/lib.es5.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2015*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2016*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2017*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2018*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2019*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2020*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2021*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2022*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.es2023*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.esnext*.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.d.ts /app/lib/ && \
    cp /tmp/ts-repo/lib/lib.dom.d.ts /app/lib/ 2>/dev/null || true && \
    cp /tmp/ts-repo/lib/lib.dom.iterable.d.ts /app/lib/ 2>/dev/null || true && \
    cp /tmp/ts-repo/lib/lib.scripthost.d.ts /app/lib/ 2>/dev/null || true && \
    cp /tmp/ts-repo/lib/lib.webworker*.d.ts /app/lib/ 2>/dev/null || true && \
    cp /tmp/ts-repo/lib/lib.decorators*.d.ts /app/lib/ 2>/dev/null || true

RUN mkdir -p /checksums && \
    find /app/tests -name "*.ts" -exec sha256sum {} + | sort > /checksums/test_checksums.txt

RUN mkdir -p /out/hidden && \
    cp -r /tmp/hidden_tests/* /out/hidden/ && \
    cp /tmp/hidden_expected.json /out/hidden_expected.json && \
    cp /tmp/hidden_manifest.json /out/hidden_manifest.json
GENEOF

cp "$SCRIPT_DIR/environment/build_tests.py" "$TMPDIR/build_tests.py"

docker build --build-arg TS_VERSION="$TS_VERSION" -t ts-checker-generator "$TMPDIR"
rm -rf "$TMPDIR"

echo ""
echo "=== Extracting assets ==="

CID=$(docker create ts-checker-generator)

rm -rf "$VISIBLE_OUT" "$HIDDEN_OUT" "$LIB_OUT" "$CHECKSUMS_OUT"
mkdir -p "$VISIBLE_OUT" "$HIDDEN_OUT/test_files" "$LIB_OUT" "$CHECKSUMS_OUT"

docker cp "$CID:/app/tests/." "$VISIBLE_OUT/"
docker cp "$CID:/app/lib/." "$LIB_OUT/"
docker cp "$CID:/checksums/test_checksums.txt" "$CHECKSUMS_OUT/"
docker cp "$CID:/out/hidden/." "$HIDDEN_OUT/test_files/"
docker cp "$CID:/out/hidden_expected.json" "$HIDDEN_OUT/hidden_expected.json"
docker cp "$CID:/out/hidden_manifest.json" "$HIDDEN_OUT/hidden_manifest.json"

docker rm "$CID" > /dev/null

N_VISIBLE=$(find "$VISIBLE_OUT" -name "*.ts" | wc -l)
N_HIDDEN=$(find "$HIDDEN_OUT/test_files" -name "*.ts" | wc -l)
N_LIB=$(find "$LIB_OUT" -name "*.d.ts" | wc -l)

echo ""
echo "=== Done ==="
echo "Visible tests:  $N_VISIBLE  -> $VISIBLE_OUT"
echo "Hidden tests:   $N_HIDDEN  -> $HIDDEN_OUT"
echo "Lib files:      $N_LIB  -> $LIB_OUT"
echo ""
echo "Now rebuild the Docker image:  docker build -t ts-type-checker environment/"
