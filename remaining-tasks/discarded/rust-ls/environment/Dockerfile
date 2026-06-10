FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    tmux \
    ca-certificates \
    curl \
    git \
    bc \
    pkg-config \
    openssl \
    file \
    && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

COPY workspace/ /app/workspace/
COPY build_tests.py /tmp/build_tests.py

# Single layer: create oracle from system ls, generate tests, encrypt oracle,
# then delete all plaintext traces. Because it's one layer, the oracle binary
# never persists in the final image — agents cannot extract it.
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

RUN mkdir -p /logs/agent /logs/verifier /logs/artifacts

WORKDIR /app/workspace
