I need you to fix the static linker for x86-64 Linux. There's already an implementation in `myld.c` -- it compiles cleanly and gets part of the way there (it parses the inputs and emits structurally valid ELF files), but the executables it produces don't actually run correctly, so most of the test programs fail. Your job is to debug and fix the existing `myld.c` so the linked programs run and produce the right output. The `Makefile` is already set up, so just run `make` to compile.

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
- Use `objdump -d` to disassemble and check code
- Compile test programs with `musl-gcc -static` to see what a correct binary looks like
- Compare your output against `gcc -static -nostdlib` for the simple tests
- The system header `<elf.h>` has all the ELF struct definitions you'll need

## Archives

A `.a` file is a collection of `.o` files with an index. The standard approach: scan for undefined symbols, pull in archive members that define them, repeat until no new symbols are resolved. Don't include members the program doesn't need.

## Important

- Don't shell out to `ld`, `gcc`, or any other linker -- implement the linking yourself.
- Don't use `system()` or `popen()`.
- The executable must run correctly -- not just be a valid ELF file, but actually produce the right output when executed.
