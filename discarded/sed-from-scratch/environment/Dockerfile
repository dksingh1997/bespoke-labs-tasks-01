FROM --platform=linux/amd64 python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git tmux \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY workspace/ /app/
