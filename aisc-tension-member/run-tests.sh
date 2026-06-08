#!/bin/bash
set -euo pipefail
mkdir -p /logs/verifier

if [ -d /tests/tests ]; then
    cp -r /tests/tests/. /tests/
fi

bash /tests/test.sh
