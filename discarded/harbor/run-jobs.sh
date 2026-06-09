#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

# Use global harbor install (newer version handles model quirks better)
export PATH="$HOME/.local/bin:$PATH"

MODEL="${1:-anthropic/claude-opus-4-7}"
AGENT="${2:-terminus-2}"
TASK="${3:-}"

if [ -z "$TASK" ]; then
    echo "Usage: ./run-jobs.sh [model] [agent] <task-path>"
    echo ""
    echo "Defaults:"
    echo "  model:  anthropic/claude-opus-4-7"
    echo "  agent:  terminus-2"
    echo ""
    echo "Examples:"
    echo "  ./run-jobs.sh '' '' /path/to/regex-engine"
    echo "  ./run-jobs.sh anthropic/claude-sonnet-4-20250514 '' /path/to/heap-allocator"
    echo "  ./run-jobs.sh openai/gpt-4o claude-code /path/to/binary-protocol-re"
    exit 1
fi

JOB_NAME="$(basename "$TASK")-$(date +%Y%m%d-%H%M%S)"

echo "========================================"
echo "  Harbor Job Runner"
echo "========================================"
echo "Task:   $TASK"
echo "Model:  $MODEL"
echo "Agent:  $AGENT"
echo "Job:    $JOB_NAME"
echo "========================================"
echo ""

exec harbor run \
    -p "$TASK" \
    -m "$MODEL" \
    -a "$AGENT" \
    -k 1 \
    -n 1 \
    --job-name "$JOB_NAME"
