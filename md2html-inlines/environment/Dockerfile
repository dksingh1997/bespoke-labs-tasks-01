FROM python:3.11-slim

# Build/runtime toolchain for compiling the agent's C converter, plus the Harbor
# hard-rule tooling (git, tmux, strace). build-essential/gcc/make stay in the
# final image because the verifier compiles the agent's code at grading time.
# procps -> pkill/pgrep for the verifier's agent-process isolation; file -> the
# ELF sanity check; both are load-bearing for the anti-cheat prologue.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    make \
    tmux \
    strace \
    procps \
    file \
    ca-certificates \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Build cmark from source and install it OUTSIDE /app into a root-only verifier
# location. Keeping it out of /app means the agent-owned workspace chown below
# cannot hand the reference implementation to the agent (a writable cmark could
# be swapped for a slow stub to inflate the performance ratio).
RUN git clone --depth 1 https://github.com/commonmark/cmark.git /tmp/cmark-src && \
    cd /tmp/cmark-src && \
    mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/opt/verifier_tools/cmark_install && \
    make -j$(nproc) && \
    make install && \
    rm -rf /tmp/cmark-src && \
    chown -R root:root /opt/verifier_tools && \
    chmod -R go-rwx /opt/verifier_tools

# cmake was only needed to build cmark; drop it. git/tmux/strace are Harbor
# hard-rule tools and must remain in the final image.
RUN apt-get purge -y cmake && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Non-root agent user (isolation; see HARBOR_GUIDE section 5).
RUN useradd --create-home --shell /bin/bash agent

# /tests: root-only. Harbor uploads the verifier here at runtime; this prevents
# the agent from planting files (hidden_cases/perf_data) or reading the oracle.
RUN mkdir -p /tests && chmod 700 /tests

# /solution: agent-owned so Harbor can upload the oracle's solve.sh.
RUN mkdir -p /solution && chown agent:agent /solution

# Agent workspace: starter sources + the visible test suite (the editable surface).
COPY test-suite/ /app/test-suite/
COPY workspace/ /app/workspace/

# Agent owns /app so it can build/iterate. cmark lives in /opt (root-only), so
# this chown does not expose any verifier tooling.
RUN chown -R agent:agent /app

# Default user stays root (the verifier runs as root and traverses /tests);
# Harbor switches to `agent` for the agent phase via [agent] user in task.toml.
WORKDIR /app/workspace
