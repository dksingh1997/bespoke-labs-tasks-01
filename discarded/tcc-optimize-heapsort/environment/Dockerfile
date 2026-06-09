# ============================================================================
# BUILD STAGE: Compile TCC once with GCC (bootstrap compiler)
# ============================================================================
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install GCC only in build stage
RUN apt-get update && apt-get install -y \
    gcc \
    make \
    && rm -rf /var/lib/apt/lists/*

# Build TCC with GCC to create bootstrap compiler
COPY compiler-src/tcc /build/tcc
WORKDIR /build/tcc
RUN ./configure && make

# Verify bootstrap TCC works
RUN echo 'int main() { return 0; }' > /tmp/test.c && \
    ./tcc -B/build/tcc /tmp/test.c -o /tmp/test && \
    /tmp/test && \
    echo "Bootstrap TCC compiled successfully with GCC"

# Test that TCC can compile itself (self-hosting verification)
RUN ./tcc -B/build/tcc tcc.c -o tcc-self && \
    ./tcc-self --version && \
    echo "Self-hosting verified: TCC can compile itself"

# ============================================================================
# RUNTIME STAGE: NO GCC (impossible to cheat)
# ============================================================================
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Install tools but NO gcc/g++
# Note: libc6-dev provides crt*.o files needed by TCC, but NOT gcc
RUN apt-get update && apt-get install -y \
    make \
    bc \
    git \
    numdiff \
    python3 \
    time \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/*

# Verify GCC is NOT present
RUN ! command -v gcc && ! command -v g++ && ! command -v cc || \
    (echo "ERROR: GCC found in runtime image!" && exit 1)

# Create directory structure
RUN mkdir -p /app/compiler-src /app/compiler-benchmarks /logs/verifier /logs/agent

# Copy ONLY the pre-built TCC binary from builder (NOT gcc)
COPY --from=builder /build/tcc/tcc /usr/local/bin/tcc-bootstrap
COPY --from=builder /build/tcc/libtcc1.a /usr/local/lib/tcc/libtcc1.a
COPY --from=builder /build/tcc/include /usr/local/lib/tcc/include

# Copy full TCC build for reference (includes headers, lib)
COPY --from=builder /build/tcc /usr/local/tcc-bootstrap-full

# Copy TCC source (agent will modify this)
COPY compiler-src/tcc /app/compiler-src/tcc

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

# Test that bootstrap TCC works in runtime environment
RUN echo 'int main() { return 42; }' > /tmp/test.c && \
    tcc-bootstrap -B/usr/local/tcc-bootstrap-full /tmp/test.c -o /tmp/test && \
    /tmp/test ; [ $? -eq 42 ] && \
    rm -f /tmp/test.c /tmp/test && \
    echo "Bootstrap TCC verified in runtime environment"

# Double-check: GCC absolutely not present
RUN echo "Final verification: GCC is not present" && \
    ! command -v gcc && ! command -v g++ && ! command -v cc && \
    echo "✓ No GCC in runtime environment - cheating is impossible"

WORKDIR /app/compiler-src/tcc
