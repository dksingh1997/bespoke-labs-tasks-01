I need you to fix a static linker for x86-64 Linux. There's already a substantial implementation in `myld.c` -- it compiles cleanly, parses ELF object files and archives, merges sections, lays out segments, writes a valid ELF executable with a section header table, and the simplest programs already run correctly. But something in the relocation handling is logically wrong: programs that make function calls or reference symbols across files produce the wrong result or crash, even though the output is a structurally valid ELF. Your job is to find the incorrect step and fix it. The `Makefile` is already set up, so just run `make` to compile.

Keep it as a single `myld.c`. It takes `.o` object files and `.a` static archive files and produces a working ELF executable.

## What it needs to do

Your linker gets invoked like:

```
./myld -o output file1.o file2.o libfoo.a
```

It should:

1. Read ELF relocatable object files (`.o`) and static archives (`.a`)
2. Resolve symbols across all input files
3. Merge code and data sections into a single executable
4. Apply relocations so function calls and data references point to the right places
5. Write a valid ELF executable that can be run directly

## Where to look

The earlier tiers (single object, then cross-file calls, then `.bss`/archives) exercise the relocation logic the most, so start there. A program can link into a perfectly valid ELF and still compute the wrong address if a relocation type is applied with the wrong formula. Think carefully about what each relocation type means -- in particular the difference between absolute and PC-relative relocations and exactly which address a PC-relative relocation is measured from.

## Test programs

The `tests/` directory has source files and pre-compiled `.o` files for testing. They range from simple (a single `.o` that does one syscall) to complex (multiple `.o` files linked against musl libc).

Simple tests use `start.o` + `syscalls.o` from the workspace root as a minimal runtime -- they call `my_write()` and `my_exit()` for I/O without needing libc.

The harder tests use musl's static C library for `printf` and friends. The musl CRT objects and `libc.a` are installed at `/usr/lib/x86_64-linux-musl/`. To link a musl program, pass the files in this order:

```
./myld -o hello /usr/lib/x86_64-linux-musl/crt1.o \
    /usr/lib/x86_64-linux-musl/crti.o \
    tests/t4_hello_libc.o \
    /usr/lib/x86_64-linux-musl/libc.a \
    /usr/lib/x86_64-linux-musl/crtn.o
```

## Debugging tips

- Use `readelf -r`, `readelf -s`, `readelf -S` to inspect `.o` files and your output
- Use `objdump -d` to disassemble and check the bytes a relocation patched in
- Compile test programs with `musl-gcc -static` to see what a correct binary looks like
- Compare your output against `gcc -static -nostdlib` for the simple tests
- The system header `<elf.h>` has all the ELF struct definitions you'll need

## Archives

A `.a` file is a collection of `.o` files with an index. The standard approach: scan for undefined symbols, pull in archive members that define them, repeat until no new symbols are resolved. Don't include members the program doesn't need.

## Important

- Don't shell out to `ld`, `gcc`, or any other linker -- implement the linking yourself.
- Don't use `system()` or `popen()`.
- The executable must run correctly -- not just be a valid ELF file, but actually produce the right output when executed.
