FROM rust:1.77-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    diffutils \
    git \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY formatter /app/formatter

RUN chmod +x /app/formatter/tests/run_suite.sh

WORKDIR /app
