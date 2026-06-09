FROM --platform=linux/amd64 python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    musl-tools musl-dev \
    git tmux strace procps \
    && rm -rf /var/lib/apt/lists/*

# Non-root agent user (isolation; see HARBOR_GUIDE section 5).
RUN useradd --create-home --shell /bin/bash agent

# /tests: root-only. Harbor uploads the verifier here at runtime; test.sh
# re-locks it. Prevents the agent from reading the oracle or planting files.
RUN mkdir -p /tests && chmod 700 /tests

# /solution: agent-owned so Harbor can upload the oracle's solve.sh.
RUN mkdir -p /solution && chown agent:agent /solution

WORKDIR /app

COPY workspace/ /app/

# Agent owns its editable workspace (myld.c + Makefile). The build artifacts
# produced by the root RUN steps below stay root-owned, so the agent cannot
# tamper with the reference .o/.ref/.a inputs the verifier links against.
RUN chown -R agent:agent /app

# Build the no-libc runtime objects
RUN gcc -c -o start.o start.S && \
    gcc -c -o syscalls.o syscalls.S

# Build the custom no-libc test programs (.o files)
RUN cd tests && \
    gcc -c -o t1_exit.o t1_exit.S && \
    gcc -fno-stack-protector -fno-pie -c -o t2_hello.o t2_hello.c && \
    gcc -fno-stack-protector -fno-pie -c -o t2_data.o t2_data.c && \
    gcc -fno-stack-protector -fno-pie -c -o t3_bss.o t3_bss.c && \
    gcc -fno-stack-protector -fno-pie -c -o t3_multi_a.o t3_multi_a.c && \
    gcc -fno-stack-protector -fno-pie -c -o t3_multi_b.o t3_multi_b.c && \
    ar rcs t3_archive.a t3_multi_a.o t3_multi_b.o

# Build the mold-adapted test programs (.o and .ref files)
RUN cd tests && \
    gcc -c -o t4_entry.o t4_entry.S && \
    gcc -c -o t4_sections.o t4_sections.S

# Build the musl-libc test programs (.o files)
RUN cd tests && \
    musl-gcc -static -c -o t4_hello_libc.o t4_hello_libc.c && \
    musl-gcc -static -c -o t5_printf.o t5_printf.c && \
    musl-gcc -static -c -o t5_multi_main.o t5_multi_main.c && \
    musl-gcc -static -c -o t5_multi_math.o t5_multi_math.c && \
    musl-gcc -static -fcommon -c -o t5_common_a.o t5_common_a.c && \
    musl-gcc -static -fcommon -c -o t5_common_b.o t5_common_b.c

# Build reference executables (linked by real toolchain)
RUN cd tests && \
    gcc -static -nostdlib -o t1_exit.ref t1_exit.o && \
    gcc -static -nostdlib -o t2_hello.ref ../start.o ../syscalls.o t2_hello.o && \
    gcc -static -nostdlib -o t2_data.ref ../start.o ../syscalls.o t2_data.o && \
    gcc -static -nostdlib -o t3_bss.ref ../start.o ../syscalls.o t3_bss.o && \
    gcc -static -nostdlib -o t3_archive.ref ../start.o ../syscalls.o t3_multi_b.o t3_archive.a && \
    gcc -static -nostdlib -o t4_entry.ref t4_entry.o && \
    gcc -static -nostdlib -o t4_sections.ref t4_sections.o && \
    musl-gcc -static -o t4_hello_libc.ref t4_hello_libc.c && \
    musl-gcc -static -o t5_printf.ref t5_printf.c && \
    musl-gcc -static -o t5_multi.ref t5_multi_main.c t5_multi_math.c && \
    musl-gcc -static -fcommon -o t5_common.ref t5_common_a.c t5_common_b.c

# === Reference-input integrity: stage pristine inputs + answers root-only ===
# The verifier links/grades against ROOT-OWNED copies under /tests/refdata that
# the agent uid can neither read nor swap:
#   * the .ref reference binaries (expected outputs) are moved OUT of the
#     agent-readable /app/tests so the agent can't read/anticipate them, and
#   * pristine .o/.a inputs (+ start.o/syscalls.o) live here so a tampered
#     /app copy can't be substituted into the graded link step.
# test.sh stages read-only .o/.a copies to a tmp dir for the agent-uid linker;
# the .ref binaries are read only by root. /app/tests keeps source + .o for the
# agent's own development, minus the now-removed .ref answer key.
RUN mkdir -p /tests/refdata && \
    cp /app/start.o /app/syscalls.o /tests/refdata/ && \
    cp /app/tests/*.o /app/tests/*.a /app/tests/*.ref /tests/refdata/ && \
    rm -f /app/tests/*.ref && \
    chmod 700 /tests && \
    chmod -R go-rwx /tests/refdata

# Default user stays root (the verifier runs as root, stages inputs, and grades
# from /tests); Harbor switches to `agent` for the agent phase via [agent] user
# in task.toml, and the verifier drops to `agent` (su) for all build/link/run.
