# ============================================================================
# BUILD STAGE: Compile PCC with GCC (bootstrap compiler)
# ============================================================================
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install GCC and build dependencies (only in build stage)
RUN apt-get update && apt-get install -y \
    gcc \
    make \
    bison \
    flex \
    libc6-dev \
    dpkg-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy PCC source
COPY compiler-src/pcc /build/pcc
COPY compiler-src/pcc-libs /build/pcc-libs

# Build PCC with GCC - use final destination path so hardcoded paths work
WORKDIR /build/pcc
RUN ./configure --prefix=/usr/local/pcc-bootstrap && \
    make && \
    make install

# Build pcc-libs with GCC
WORKDIR /build/pcc-libs
RUN ./configure --prefix=/usr/local/pcc-bootstrap CC=gcc && \
    make && \
    make install

# Verify bootstrap PCC works
RUN echo 'int main() { return 42; }' > /tmp/test.c && \
    /usr/local/pcc-bootstrap/bin/pcc -o /tmp/test /tmp/test.c && \
    /tmp/test ; [ $? -eq 42 ] && \
    echo "Bootstrap PCC compiled successfully with GCC"

# ============================================================================
# RUNTIME STAGE: NO GCC (impossible to cheat)
# ============================================================================
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install tools but NO gcc/g++
# Note: libc6-dev provides crt*.o files needed by PCC, but NOT gcc
# bison and flex are needed to rebuild PCC (parser/lexer generation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    make \
    bison \
    flex \
    bc \
    git \
    numdiff \
    python3 \
    time \
    libc6-dev \
    binutils \
    dpkg-dev \
    && rm -rf /var/lib/apt/lists/*

# Verify GCC is NOT present
RUN ! command -v gcc && ! command -v g++ && ! command -v cc || \
    (echo "ERROR: GCC found in runtime image!" && exit 1)

# Create directory structure
RUN mkdir -p /app/compiler-src /app/compiler-benchmarks /logs/verifier /logs/agent

# Copy the complete PCC installation from builder (same path so hardcoded paths work)
COPY --from=builder /usr/local/pcc-bootstrap /usr/local/pcc-bootstrap

# Create symlink for easy access to bootstrap compiler
RUN ln -s /usr/local/pcc-bootstrap/bin/pcc /usr/local/bin/pcc-bootstrap

# Copy PCC and pcc-libs source (agent will modify these)
COPY compiler-src/pcc /app/compiler-src/pcc
COPY compiler-src/pcc-libs /app/compiler-src/pcc-libs

# Copy benchmark scripts and data
COPY scripts /app/compiler-benchmarks/scripts
COPY data /app/compiler-benchmarks/data

# Copy benchmark suites
COPY benchmarks/coremark /app/compiler-benchmarks/benchmarks/coremark
COPY benchmarks/polybench /app/compiler-benchmarks/benchmarks/polybench
COPY benchmarks/gcc-torture /app/compiler-benchmarks/benchmarks/gcc-torture
COPY benchmarks/llvm-test-suite /app/compiler-benchmarks/benchmarks/llvm-test-suite

# Make scripts executable
RUN chmod +x /app/compiler-benchmarks/scripts/*.sh

# Test that bootstrap PCC works in runtime environment
RUN echo 'int main() { return 42; }' > /tmp/test.c && \
    pcc-bootstrap -o /tmp/test /tmp/test.c && \
    /tmp/test ; [ $? -eq 42 ] && \
    rm -f /tmp/test.c /tmp/test && \
    echo "Bootstrap PCC verified in runtime environment"

# Double-check: GCC absolutely not present
RUN echo "Final verification: GCC is not present" && \
    ! command -v gcc && ! command -v g++ && ! command -v cc && \
    echo "✓ No GCC in runtime environment - cheating is impossible"

WORKDIR /app/compiler-src/pcc
