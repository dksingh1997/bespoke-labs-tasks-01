FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential python3 python3-pip tmux jq \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/checker /app/tests /app/lib \
    /logs/agent /logs/verifier /logs/artifacts

# Visible test files + answer key (agent uses these to develop their checker)
COPY visible_tests/ /app/tests/

# TypeScript standard library type definitions
COPY lib/ /app/lib/

# Parser libraries (available globally via require('@babel/parser') etc.)
RUN npm install -g @babel/parser @babel/traverse @babel/types 2>/dev/null || true
ENV NODE_PATH=/usr/local/lib/node_modules

# Starter checker — a working TS2304 detector the agent can extend
COPY starter/tscheck /app/checker/tscheck
RUN chmod +x /app/checker/tscheck

WORKDIR /app
