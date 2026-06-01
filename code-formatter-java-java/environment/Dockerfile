FROM eclipse-temurin:17-jdk-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    diffutils \
    git \
    python3 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install google-java-format for oracle solution
RUN wget -q https://github.com/google/google-java-format/releases/download/v1.19.2/google-java-format-1.19.2-all-deps.jar \
    -O /usr/local/lib/google-java-format.jar || true

COPY formatter /app/formatter

RUN chmod +x /app/formatter/tests/run_suite.sh

WORKDIR /app
