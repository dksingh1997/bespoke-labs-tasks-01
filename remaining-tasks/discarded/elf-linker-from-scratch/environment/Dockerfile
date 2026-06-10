FROM --platform=linux/amd64 python:3.13-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    musl-tools musl-dev \
    git tmux \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY workspace/ /app/

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
