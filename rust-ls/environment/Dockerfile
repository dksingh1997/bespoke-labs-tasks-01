FROM python:3.11-slim

# Harbor hard-rule tooling (git/tmux/strace) + verifier helpers (openssl/bc/file)
# + the Rust build toolchain prerequisites.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    tmux \
    strace \
    ca-certificates \
    curl \
    git \
    bc \
    pkg-config \
    openssl \
    file \
    && rm -rf /var/lib/apt/lists/*

# Install the Rust toolchain SYSTEM-WIDE so the non-root `agent` user can use it.
# rustup defaults to /root/.cargo (root-owned, mode 700) which the `agent` user
# (task.toml [agent] user = "agent") cannot read -> `cargo: command not found`,
# making the task impossible. Install into /usr/local/{rustup,cargo} and mark it
# a+rX (agent can read/execute, not tamper). RUSTUP_HOME is exported so the
# rustup shims locate the toolchain; CARGO_HOME is intentionally NOT exported so
# each user (agent at build time, root in the verifier) gets a writable ~/.cargo
# for build caches.
ENV RUSTUP_HOME=/usr/local/rustup
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | \
        CARGO_HOME=/usr/local/cargo RUSTUP_HOME=/usr/local/rustup sh -s -- -y --no-modify-path \
    && chmod -R a+rX /usr/local/cargo /usr/local/rustup
ENV PATH="/usr/local/cargo/bin:/usr/local/bin:/usr/local/sbin:/usr/sbin:/usr/bin:/sbin:/bin"
# Harbor's login shells (`bash -lc`) rebuild PATH from /etc/profile and drop the
# ENV PATH above, so put the toolchain on PATH for login + interactive shells too
# (otherwise the agent gets "cargo: command not found" under bash -lc).
RUN printf 'export PATH="/usr/local/cargo/bin:$PATH"\nexport RUSTUP_HOME=/usr/local/rustup\n' > /etc/profile.d/10-rust.sh \
    && chmod 644 /etc/profile.d/10-rust.sh \
    && printf '\nexport PATH="/usr/local/cargo/bin:$PATH"\nexport RUSTUP_HOME=/usr/local/rustup\n' >> /etc/bash.bashrc

# Non-root agent user (isolation; see HARBOR_GUIDE section 5).
RUN useradd --create-home --shell /bin/bash agent

COPY workspace/ /app/workspace/
COPY build_tests.py /tmp/build_tests.py

# Single layer: create oracle from system ls, generate fixtures + test
# definitions, encrypt oracle, then delete all plaintext traces. Because it's
# one layer, the oracle binary never persists in the final image — agents cannot
# extract it.
RUN mkdir -p /oracle && cp /usr/bin/ls /oracle/ls && chmod 755 /oracle/ls \
    && python3 /tmp/build_tests.py \
    && mkdir -p /app/.test_data \
    && openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
         -in /oracle/ls \
         -out /app/.test_data/oracle.enc \
         -pass pass:r5tL5_v3r1f1er_k3y_8f2a \
    && rm -rf /oracle /tmp/build_tests.py \
    && rm -f /expected/*.expected /expected/.checksums /expected/manifest.json

# Disable system ls, dir, and vdir (all coreutils ls variants)
RUN for bin in /usr/bin/ls /usr/bin/dir /usr/bin/vdir; do \
        printf '#!/bin/sh\necho "ERROR: %s is disabled" >&2\nexit 1\n' "$(basename $bin)" > "$bin" \
        && chmod 755 "$bin"; \
    done

# /tests: root-only. Harbor uploads the verifier here at runtime (merge
# semantics). We bake the AUTHORITATIVE fixtures + test definitions here so the
# (non-root) agent cannot read or tamper with them — the verifier reads these,
# not the agent-writable copies under /app. The agent keeps its own
# informational copies in /app/fixtures and /app/tests for self-validation.
RUN mkdir -p /tests && chmod 700 /tests \
    && cp -a /app/tests/. /tests/ \
    && cp -a /app/fixtures /tests/fixtures

# /solution: agent-owned so Harbor can upload the oracle's solve.sh.
RUN mkdir -p /solution && chown agent:agent /solution

RUN mkdir -p /logs/agent /logs/verifier /logs/artifacts

# Agent owns its workspace (and its informational /app/fixtures + /app/tests
# copies). Done AFTER the authoritative copies are baked into root-only /tests.
RUN chown -R agent:agent /app

# Final hardening: keep the AUTHORITATIVE test DEFINITIONS (the tier*/ JSON
# "test-flag list") inaccessible to the non-root agent during the AGENT phase
# too, not only at verify-time. `chmod 700 /tests` earlier locked just the TOP
# dir; Harbor's task-file upload can reset /tests itself back to 0755, after
# which the original go-readable bits (0644 JSON) would expose the list. So we
# re-assert 700 on the top dir AND strip every group/other bit from everything
# under /tests — EXCEPT the /tests/fixtures subtree, which is deliberately left
# world-rX. The verifier stages /tests/fixtures with `cp -a` (preserving the
# exact fixture modes that `ls -l` is scored against) and the agent-UID binary
# must be able to read that staged copy; locking it breaks scoring. Fixtures are
# not the leak anyway — the agent already holds informational copies under
# /app/fixtures, and while /tests stays 700 they are unreachable regardless. The
# verifier runs as ROOT and reads all of /tests regardless of these bits.
RUN chmod 700 /tests \
    && find /tests -mindepth 1 -path /tests/fixtures -prune -o -exec chmod go-rwx {} +

# Default user stays root (the verifier runs as root and traverses /tests);
# Harbor switches to `agent` for the agent phase via [agent] user in task.toml.
WORKDIR /app/workspace
