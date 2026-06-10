FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    pkg-config \
    git \
    protobuf-compiler \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Install Rust via rustup (nightly toolchain for compatibility with oracle solution)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    --default-toolchain nightly-2025-08-08
ENV PATH="/root/.cargo/bin:$PATH"

WORKDIR /app

# Copy the scaffold workspace
COPY workspace/ /app/

# Fetch dependencies and pre-compile what we can (caches build artifacts)
RUN cargo fetch
RUN cargo build --tests 2>/dev/null || true

WORKDIR /app
