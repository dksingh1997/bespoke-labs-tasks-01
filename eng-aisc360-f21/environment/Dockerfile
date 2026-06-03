FROM python:3.12-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    diffutils \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir numpy

COPY calculator /app/calculator

RUN chmod +x /app/calculator/tests/run_suite.sh

WORKDIR /app
