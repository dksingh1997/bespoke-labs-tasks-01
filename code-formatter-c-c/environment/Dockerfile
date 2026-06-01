FROM gcc:13-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    clang-format \
    curl \
    diffutils \
    git \
    python3 \
    && rm -rf /var/lib/apt/lists/*

COPY formatter /app/formatter

RUN chmod +x /app/formatter/tests/run_suite.sh

WORKDIR /app
