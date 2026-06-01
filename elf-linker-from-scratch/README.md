# elf-linker-from-scratch

Build a static ELF linker for x86-64 Linux in C.

## Task

The agent implements `myld.c` -- a static linker that reads `.o` object files and `.a` static archives and produces working ELF executables. Test programs range from simple no-libc programs (using raw syscalls) to real C programs linked against musl's static libc.

## Test suite

Tests are adapted from [mold](https://github.com/rui314/mold)'s public test suite plus custom programs. Verification compares execution output and `readelf` structural checks against binaries linked by the real toolchain (`gcc`/`ld`).

Five tiers with increasing weights:
- T1 (0.08): single .o, inline syscall
- T2 (0.12): cross-file linking, data sections
- T3 (0.16): BSS, archive (.a) parsing
- T4 (0.24): mold-adapted structural tests + musl hello world
- T5 (0.40): printf formatting, multi-file musl, common symbols

## Difficulty

Hard. The linker must handle ~290 object files for a hello-world (musl pulls in 286 members from libc.a), produce byte-correct ELF headers and program headers, apply 6 relocation types, create a GOT, and define synthetic linker symbols. A single wrong offset causes a segfault with no useful debugging output.
