FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    git \
    make \
    tmux \
    xxd \
    bsdmainutils \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY workspace/ /app/workspace/

RUN mkdir -p /logs/agent /logs/verifier /logs/artifacts

WORKDIR /app/workspace
