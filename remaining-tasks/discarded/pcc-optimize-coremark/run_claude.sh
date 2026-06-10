#!/bin/bash
# Harbor run script for Claude Code agent

cd "$(dirname "$0")"
source .env

echo "Starting Harbor run at $(date)"
echo "Task: PCC Optimization"
echo "Agent: claude-code"
echo "Model: anthropic/claude-opus-4-6"
echo ""

sudo -E /home/ubuntu/.local/bin/harbor run \
  -p . \
  -a claude-code \
  -m anthropic/claude-opus-4-6 \
  --override-cpus 2

echo ""
echo "Finished at $(date)"
