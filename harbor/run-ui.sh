#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

export PATH="$HOME/.local/bin:$PATH"

echo "Starting Harbor Viewer on http://127.0.0.1:8080"
echo "Jobs folder: $REPO_ROOT/jobs"
echo ""

exec harbor view jobs --port 8080
