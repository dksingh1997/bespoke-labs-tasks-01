#!/bin/bash
# Harbor run script for Codex agent

cd "$(dirname "$0")"
source .env
source $HOME/.local/bin/env

echo "Starting Harbor run at $(date)"
echo "Task: TCC Optimization"
echo "Agent: codex"
echo "Model: gpt-5.2-codex"
echo ""

sudo -E /home/ubuntu/.local/bin/harbor run \
  -p . \
  -a codex \
  -m gpt-5.2-codex \
  --override-cpus 2

echo ""
echo "Finished at $(date)"
