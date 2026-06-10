FROM --platform=linux/amd64 python:3.13-slim

# Harbor hard-rule tooling: git/tmux/strace. build-essential supplies gcc/make so
# the agent can build mysed offline (allow_internet=false; nothing else needed).
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git tmux strace \
    && rm -rf /var/lib/apt/lists/*

# Non-root agent user (isolation; see HARBOR_GUIDE section 5).
RUN useradd --create-home --shell /bin/bash agent

# /tests: root-only. Harbor uploads the verifier here at runtime; test.sh
# re-locks it. Prevents the agent from reading the golden files or planting files.
RUN mkdir -p /tests && chmod 700 /tests

# /solution: agent-owned so Harbor can upload the oracle's solve.sh.
RUN mkdir -p /solution && chown agent:agent /solution

# Agent workspace: build files + reference doc (the editable surface).
WORKDIR /app
COPY workspace/ /app/
RUN chown -R agent:agent /app

# Default user stays root (the verifier runs as root and traverses /tests);
# Harbor switches to `agent` for the agent phase via [agent] user in task.toml.
