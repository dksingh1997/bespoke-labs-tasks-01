FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    git \
    make \
    tmux \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY workspace/ /app/workspace/

RUN mkdir -p /logs/agent /logs/verifier /logs/artifacts

WORKDIR /app/workspace
