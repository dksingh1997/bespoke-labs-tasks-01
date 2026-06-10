FROM node:20-slim

# Harbor hard-rule tooling (git/tmux/strace) + verifier helpers. build-essential
# provides the gcc/g++/make the instruction promises; jq for verifier convenience.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git build-essential python3 python3-pip tmux strace jq \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/checker /app/tests /app/lib \
    /logs/agent /logs/verifier /logs/artifacts

# Non-root agent user (isolation; see HARBOR_GUIDE section 5).
# node:20-slim ships a stock `node` user at UID/GID 1000. Harbor's mounted-docker
# environment pre-creates bind-mounted log files (e.g. /logs/agent/oracle.txt) as
# the host user (UID 1000). A freshly-`useradd`ed agent would land at UID 1001 and
# could NOT write those host-owned files, so the oracle's
# `solve.sh > /logs/agent/oracle.txt 2>&1` redirect would fail with EACCES and
# solve.sh would never run (no marker, no checker -> oracle scores 0.0). Rename the
# stock node user to `agent` so it keeps UID/GID 1000 and can write the bind mounts.
RUN groupmod -n agent node \
    && usermod -l agent -d /home/agent -m -s /bin/bash node

# /tests: root-only. Harbor uploads the verifier here at runtime; test.sh
# re-locks it. Prevents the agent from reading the oracle or planting files.
RUN mkdir -p /tests && chmod 700 /tests

# /solution: agent-owned so Harbor can upload the oracle's solve.sh.
RUN mkdir -p /solution && chown agent:agent /solution

# Parser libraries (available globally via require('@babel/parser') etc.).
# Pinned to the stable 7.x line (8.0 is still RC and changes the parser/traverse
# API the starter relies on). No `|| true`: a failed parser install must fail the
# build loudly rather than silently produce a broken starter.
RUN npm install -g @babel/parser@^7 @babel/traverse@^7 @babel/types@^7
ENV NODE_PATH=/usr/local/lib/node_modules

# Visible test files + answer key (agent uses these to develop their checker)
COPY visible_tests/ /app/tests/

# TypeScript standard library type definitions
COPY lib/ /app/lib/

# Starter checker — a working TS2304 detector the agent can extend
COPY starter/tscheck /app/checker/tscheck
RUN chmod +x /app/checker/tscheck

# Agent owns its editable workspace; the verifier (root) can still read it.
RUN chown -R agent:agent /app

# Default user stays root (the verifier runs as root and traverses /tests);
# Harbor switches to `agent` for the agent phase via [agent] user in task.toml.
WORKDIR /app
CMD ["sleep", "infinity"]
