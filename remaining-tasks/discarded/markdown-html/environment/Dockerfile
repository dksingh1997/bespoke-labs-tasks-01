FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    make \
    tmux \
    ca-certificates \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/*

# Build cmark from source and install to a hidden verifier location.
# The agent cannot access /app/verifier_tools/.
RUN git clone --depth 1 https://github.com/commonmark/cmark.git /tmp/cmark-src && \
    cd /tmp/cmark-src && \
    mkdir build && cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/app/verifier_tools/cmark_install && \
    make -j$(nproc) && \
    make install && \
    rm -rf /tmp/cmark-src

# Remove git and cmake (only needed for building cmark)
RUN apt-get purge -y git cmake && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

COPY test-suite/ /app/test-suite/
COPY workspace/ /app/workspace/

WORKDIR /app/workspace
