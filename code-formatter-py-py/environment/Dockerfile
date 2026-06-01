FROM python:3.12-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    diffutils \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY formatter /app/formatter

RUN chmod +x /app/formatter/tests/run_suite.sh

WORKDIR /app
