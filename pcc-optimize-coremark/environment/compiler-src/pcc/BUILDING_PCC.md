# Building PCC (Portable C Compiler) From Source

A comprehensive guide to building pcc with itself (self-hosting/bootstrapping).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Repository Structure](#repository-structure)
4. [Understanding the Components](#understanding-the-components)
5. [Stage 1: Building PCC with GCC](#stage-1-building-pcc-with-gcc)
6. [Building PCC-LIBS](#building-pcc-libs)
7. [Stage 2: Building PCC with PCC](#stage-2-building-pcc-with-pcc)
8. [Stage 3: Verifying Self-Consistency](#stage-3-verifying-self-consistency)
9. [Using PCC Without System Installation](#using-pcc-without-system-installation)
10. [Troubleshooting](#troubleshooting)
11. [Reference](#reference)

---

## Overview

### What is PCC?

PCC (Portable C Compiler) is a C compiler with roots dating back to the 1970s, originally written by Stephen C. Johnson at Bell Labs. The modern version is a complete rewrite that maintains the spirit of simplicity and portability while supporting contemporary C standards.

### What is Self-Hosting/Bootstrapping?

A self-hosting compiler can compile its own source code. The bootstrapping process proves that a compiler is correct and complete enough to reproduce itself:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Stage 1: External compiler (gcc) compiles pcc → pcc-stage1            │
│           This creates the first working pcc binary                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Stage 2: pcc-stage1 compiles pcc source → pcc-stage2                  │
│           This proves pcc can compile itself                            │
├─────────────────────────────────────────────────────────────────────────┤
│  Stage 3: pcc-stage2 compiles pcc source → pcc-stage3                  │
│           If stage2 == stage3, pcc is self-consistent (reproducible)   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Why Bootstrap?

1. **Correctness verification**: If pcc can compile itself and produce an identical binary, it demonstrates the compiler works correctly
2. **Independence**: Once bootstrapped, pcc no longer depends on gcc or any other compiler
3. **Trust**: You can verify the compiler by rebuilding it from source

---

## Prerequisites

### Required Packages

```bash
# On Debian/Ubuntu
sudo apt-get update
sudo apt-get install -y build-essential bison flex git

# On Fedora/RHEL
sudo dnf install -y gcc make bison flex git

# On macOS (with Homebrew)
brew install bison flex
```

### Why These Dependencies?

| Package | Purpose |
|---------|---------|
| `gcc` (or `clang`) | Bootstrap compiler for Stage 1 |
| `make` | Build automation |
| `bison` | Parser generator (YACC compatible) - generates C parser from `cgram.y` |
| `flex` | Lexical analyzer generator - generates scanner from `scan.l` |
| `git` | Clone the repositories |

### System Requirements

- **OS**: Linux, *BSD, macOS, or Windows (MinGW/Cygwin)
- **Architecture**: x86, x86_64/amd64, ARM, PowerPC, MIPS, and others
- **Disk space**: ~100MB for build, ~10MB installed
- **RAM**: Minimal (compiles on systems with 64MB RAM)

---

## Repository Structure

### Cloning the Repositories

```bash
# Clone the compiler
git clone https://github.com/PortableCC/pcc.git

# Clone the runtime libraries
git clone https://github.com/PortableCC/pcc-libs.git
```

### Alternative Mirrors

| Repository | URL | Notes |
|------------|-----|-------|
| PortableCC (GitHub) | https://github.com/PortableCC/pcc | Recommended - most current |
| IanHarvey (GitHub) | https://github.com/IanHarvey/pcc | Popular mirror, many commits |
| repo.or.cz | https://repo.or.cz/pcc.git | Historical official hosting |
| sylvandb (GitHub) | https://github.com/sylvandb/pcc-portable-C-compiler | CVS mirror |

### PCC Directory Structure

```
pcc/
├── configure.ac          # Autoconf input - defines build configuration
├── configure             # Generated configure script
├── Makefile.in           # Makefile template
├── config.h.in           # Config header template
├── DATESTAMP             # Version date
│
├── cc/                   # C compiler components
│   ├── cc/               # Driver program (pcc binary)
│   │   ├── cc.c          # Main driver source (~2500 lines)
│   │   └── Makefile.in
│   │
│   ├── cpp/              # C Preprocessor
│   │   ├── cpp.c         # Preprocessor implementation
│   │   ├── cpc.c         # Character processing
│   │   ├── token.c       # Token handling
│   │   └── Makefile.in
│   │
│   ├── ccom/             # C Compiler proper
│   │   ├── cgram.y       # C grammar (Bison/YACC input)
│   │   ├── scan.l        # Lexical scanner (Flex/LEX input)
│   │   ├── main.c        # Compiler entry point
│   │   ├── trees.c       # AST construction
│   │   ├── pftn.c        # Parse tree functions
│   │   ├── init.c        # Initializer handling
│   │   ├── inline.c      # Inline function support
│   │   ├── optim.c       # Optimizations
│   │   ├── builtins.c    # Built-in functions
│   │   ├── gcc_compat.c  # GCC compatibility
│   │   ├── pass1.h       # Pass 1 header
│   │   └── Makefile.in
│   │
│   ├── cxxcom/           # C++ Compiler (experimental)
│   │   └── ...
│   │
│   └── driver/           # Shared driver code
│       ├── strlist.c     # String list utilities
│       └── xalloc.c      # Memory allocation
│
├── mip/                  # Machine-Independent Parts
│   ├── common.c          # Common routines
│   ├── match.c           # Instruction matching
│   ├── reader.c          # Input reading
│   ├── regs.c            # Register allocation
│   ├── optim2.c          # More optimizations
│   ├── mkext.c           # External symbol table generator
│   └── manifest.h        # Common definitions
│
├── arch/                 # Architecture-specific code generators
│   ├── amd64/            # x86-64
│   │   ├── code.c        # Code generation
│   │   ├── local.c       # Local transformations
│   │   ├── local2.c      # More local code
│   │   ├── order.c       # Instruction ordering
│   │   ├── table.c       # Instruction templates
│   │   └── macdefs.h     # Machine definitions
│   ├── i386/             # x86 32-bit
│   ├── arm/              # ARM
│   ├── powerpc/          # PowerPC
│   ├── mips/             # MIPS
│   ├── m68k/             # Motorola 68000
│   ├── sparc64/          # SPARC
│   ├── vax/              # VAX (historical)
│   └── ...
│
├── os/                   # OS-specific definitions
│   ├── linux/
│   │   └── ccconfig.h    # Linux-specific config
│   ├── darwin/
│   ├── freebsd/
│   ├── netbsd/
│   ├── openbsd/
│   └── ...
│
├── common/               # Common utilities
│   └── compat.c          # Compatibility functions
│
└── f77/                  # Fortran 77 compiler (optional)
    ├── f77/              # Fortran driver
    └── fcom/             # Fortran compiler
```

### PCC-LIBS Directory Structure

```
pcc-libs/
├── configure.ac          # Autoconf input
├── configure             # Configure script
├── Makefile.in
│
├── libpcc/               # PCC Runtime Library
│   ├── include/          # Compiler-specific headers
│   │   ├── stddef.h      # Standard definitions
│   │   ├── stdarg.h      # Variable arguments
│   │   ├── stdbool.h     # Boolean type
│   │   ├── float.h       # Floating-point limits
│   │   ├── limits.h      # Integer limits
│   │   └── iso646.h      # Alternative operators
│   │
│   ├── quad.h            # 64-bit integer definitions
│   ├── muldi3.c          # 64-bit multiplication
│   ├── divdi3.c          # 64-bit division
│   ├── moddi3.c          # 64-bit modulo
│   ├── udivdi3.c         # Unsigned 64-bit division
│   ├── umoddi3.c         # Unsigned 64-bit modulo
│   ├── ashldi3.c         # 64-bit left shift
│   ├── ashrdi3.c         # 64-bit arithmetic right shift
│   ├── lshrdi3.c         # 64-bit logical right shift
│   ├── cmpdi2.c          # 64-bit comparison
│   ├── ucmpdi2.c         # Unsigned 64-bit comparison
│   ├── negdi2.c          # 64-bit negation
│   ├── adddi3.c          # 64-bit addition (unused on 64-bit)
│   ├── subdi3.c          # 64-bit subtraction (unused on 64-bit)
│   ├── fixdfdi.c         # double → int64 conversion
│   ├── fixsfdi.c         # float → int64 conversion
│   ├── fixunsdfdi.c      # double → uint64 conversion
│   ├── fixunssfdi.c      # float → uint64 conversion
│   ├── floatdidf.c       # int64 → double conversion
│   ├── floatdisf.c       # int64 → float conversion
│   ├── floatunsdidf.c    # uint64 → double conversion
│   ├── qdivrem.c         # 64-bit division/remainder
│   ├── cxmuldiv.c        # Complex number multiply/divide
│   ├── ssp.c             # Stack smashing protection
│   ├── unwind.c          # Exception unwinding stubs
│   └── Makefile.in
│
├── libsoftfloat/         # Software Floating-Point Library
│   ├── bits32/           # 32-bit implementations
│   ├── bits64/           # 64-bit implementations
│   │   └── softfloat.c   # Main soft-float implementation
│   ├── arch/             # Architecture-specific parts
│   ├── softfloat.txt     # Documentation
│   └── Makefile.in
│
└── csu/                  # C Startup Code
    ├── README
    ├── linux/            # Linux startup code
    │   ├── crtbegin.c    # Constructor list begin
    │   ├── crtend.c      # Constructor list end
    │   └── Makefile
    ├── darwin/           # macOS startup code
    ├── netbsd/           # NetBSD startup code
    └── Makefile.in
```

---

## Understanding the Components

### The Compilation Pipeline

When you run `pcc -o hello hello.c`, here's what happens:

```
                                    ┌─────────────────┐
                                    │   hello.c       │
                                    │   (source)      │
                                    └────────┬────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  1. PREPROCESSOR (cpp)                                                  │
│     - Processes #include, #define, #ifdef, etc.                        │
│     - Expands macros                                                    │
│     - Strips comments                                                   │
│     - Output: preprocessed C code                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. COMPILER (ccom)                                                     │
│     a. Lexical Analysis (scan.l → lex.yy.c)                            │
│        - Tokenizes input: identifiers, keywords, operators, literals   │
│     b. Parsing (cgram.y → y.tab.c)                                     │
│        - Builds Abstract Syntax Tree (AST)                             │
│        - Validates C grammar                                            │
│     c. Semantic Analysis                                                │
│        - Type checking                                                  │
│        - Symbol table management                                        │
│     d. Code Generation (arch/*/code.c, local.c, local2.c)             │
│        - Converts AST to assembly                                       │
│        - Register allocation                                            │
│        - Optimizations                                                  │
│     - Output: assembly code (.s file)                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. ASSEMBLER (as - system provided)                                    │
│     - Converts assembly to machine code                                 │
│     - Output: object file (.o)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. LINKER (ld - system provided)                                       │
│     - Combines object files                                             │
│     - Resolves symbols                                                  │
│     - Links with: crt1.o, crti.o, crtbegin.o,                         │
│                   libc, libpcc, crtend.o, crtn.o                       │
│     - Output: executable binary                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │     hello       │
                                    │  (executable)   │
                                    └─────────────────┘
```

### PCC Binary Components

| Binary | Location | Purpose |
|--------|----------|---------|
| `pcc` | `bin/pcc` | Driver - orchestrates the compilation process |
| `pcpp` | `bin/pcpp` | Standalone preprocessor (same binary as pcc) |
| `p++` | `bin/p++` | C++ driver (same binary as pcc) |
| `cpp` | `libexec/cpp` | Preprocessor backend |
| `ccom` | `libexec/ccom` | C compiler backend |
| `cxxcom` | `libexec/cxxcom` | C++ compiler backend |

### PCC-LIBS Components

#### libpcc.a - Compiler Runtime Library

The compiler generates calls to these functions when the target CPU doesn't natively support certain operations:

```c
// Example: 64-bit multiplication on 32-bit CPU
long long result = a * b;
// Compiler generates: result = __muldi3(a, b);

// Example: Converting double to 64-bit integer
long long x = (long long)double_value;
// Compiler generates: x = __fixdfdi(double_value);
```

| Function | Purpose | When Used |
|----------|---------|-----------|
| `__muldi3` | 64-bit multiply | 32-bit targets |
| `__divdi3` | 64-bit signed divide | 32-bit targets |
| `__moddi3` | 64-bit signed modulo | 32-bit targets |
| `__udivdi3` | 64-bit unsigned divide | 32-bit targets |
| `__umoddi3` | 64-bit unsigned modulo | 32-bit targets |
| `__ashldi3` | 64-bit left shift | Some targets |
| `__ashrdi3` | 64-bit arithmetic right shift | Some targets |
| `__lshrdi3` | 64-bit logical right shift | Some targets |
| `__fixdfdi` | double → int64 | Various |
| `__fixsfdi` | float → int64 | Various |
| `__floatdidf` | int64 → double | Various |
| `__floatdisf` | int64 → float | Various |
| `__muldc3` | Complex double multiply | Complex math |
| `__divdc3` | Complex double divide | Complex math |

#### libpccsoftfloat.a - Software Floating-Point

For CPUs without FPU hardware (embedded systems, old hardware):

| Function | Purpose |
|----------|---------|
| `__addsf3` | float addition |
| `__subsf3` | float subtraction |
| `__mulsf3` | float multiplication |
| `__divsf3` | float division |
| `__adddf3` | double addition |
| `__subdf3` | double subtraction |
| `__muldf3` | double multiplication |
| `__divdf3` | double division |

#### csu/ - C Startup Code

These object files are linked into every executable:

| File | Purpose | Provided By |
|------|---------|-------------|
| `crt0.o` / `crt1.o` | Program entry point, calls `main()` | Usually libc |
| `crti.o` | Start of `.init` section (constructor prologue) | Usually libc |
| `crtn.o` | End of `.init` section (constructor epilogue) | Usually libc |
| `crtbegin.o` | Start of constructor/destructor lists | pcc-libs |
| `crtend.o` | End of constructor/destructor lists | pcc-libs |
| `crtbeginS.o` | crtbegin for shared libraries (PIC) | pcc-libs |
| `crtendS.o` | crtend for shared libraries (PIC) | pcc-libs |
| `crtbeginT.o` | crtbegin for static executables | pcc-libs |
| `crtendT.o` | crtend for static executables | pcc-libs |

---

## Stage 1: Building PCC with GCC

### Step 1.1: Configure

```bash
cd pcc

# Basic configuration
./configure --prefix=/home/user/pcc-stage1

# Or with options
./configure --prefix=/home/user/pcc-stage1 \
    --disable-stripping \
    --enable-native
```

#### Configure Options Explained

| Option | Description |
|--------|-------------|
| `--prefix=DIR` | Installation directory (default: /usr/local) |
| `--target=ARCH` | Cross-compile target (e.g., arm-linux-gnu) |
| `--enable-tls` | Enable Thread-Local Storage support |
| `--disable-gcc-compat` | Disable GCC-specific extensions |
| `--disable-pcc-debug` | Disable internal debugging code |
| `--enable-twopass` | Build as two-pass compiler (cc0 + cc1) |
| `--disable-stripping` | Don't strip symbols from installed binaries |
| `--enable-native` | Build as native (not cross) compiler |
| `--with-incdir=DIR` | Specify default include path |
| `--with-libdir=DIR` | Specify default library path |
| `--with-assembler=PATH` | Use alternate assembler |
| `--with-linker=PATH` | Use alternate linker |

#### What Configure Does

1. **System Detection**:
   ```
   checking build system type... x86_64-pc-linux-gnu
   checking host system type... x86_64-pc-linux-gnu
   checking target system type... x86_64-pc-linux-gnu
   ```

2. **Compiler Detection**:
   ```
   checking for gcc... gcc
   checking whether the C compiler works... yes
   ```

3. **Feature Detection**:
   ```
   checking for bison... bison
   checking for flex... flex
   checking for string.h... yes
   checking for strtold... yes
   checking for vsnprintf... yes
   ```

4. **Generated Files**:
   - `config.h` - Preprocessor definitions for detected features
   - `Makefile` - Build instructions (from Makefile.in)
   - `cc/*/Makefile` - Component Makefiles

### Step 1.2: Build

```bash
make
```

#### What Make Does

1. **Build cc/cc (driver)**:
   ```bash
   gcc -c -o cc.o cc.c -DLIBEXECDIR=\"/home/user/pcc-stage1/libexec/\" ...
   gcc -c -o compat.o compat.c
   gcc -c -o strlist.o strlist.c
   gcc -c -o xalloc.o xalloc.c
   gcc cc.o compat.o strlist.o xalloc.o -o cc -lm
   ```

2. **Build cc/cpp (preprocessor)**:
   ```bash
   gcc -c -o cpp.o cpp.c
   gcc -c -o cpc.o cpc.c
   gcc -c -o token.o token.c
   gcc cpp.o cpc.o token.o -o cpp -lm
   ```

3. **Build cc/ccom (compiler)**:
   ```bash
   # First, build mkext (generates external.c from table.c)
   gcc -o mkext mkext.c common.c table.c
   ./mkext  # Generates external.c and external.h

   # Generate parser from grammar
   bison -y -d cgram.y        # Produces y.tab.c, y.tab.h
   mv y.tab.c cgram.c
   mv y.tab.h cgram.h

   # Generate scanner from lexer spec
   flex scan.l                # Produces lex.yy.c
   mv lex.yy.c scan.c

   # Compile everything
   gcc -c -o cgram.o cgram.c
   gcc -c -o scan.o scan.c
   gcc -c -o trees.o trees.c
   gcc -c -o pftn.o pftn.c
   # ... (many more object files)
   gcc *.o -o ccom -lm
   ```

### Step 1.3: Install

```bash
make install
```

#### Installed Files

```
/home/user/pcc-stage1/
├── bin/
│   ├── pcc                  # Main driver (installed as pcc, pcpp, p++)
│   ├── pcpp                 # Same binary, preprocessor mode
│   └── p++                  # Same binary, C++ mode
├── libexec/
│   ├── cpp                  # Preprocessor backend
│   ├── ccom                 # C compiler backend
│   └── cxxcom               # C++ compiler backend
├── lib/pcc/x86_64-pc-linux-gnu/1.2.0.DEVEL/
│   ├── include/             # (empty until pcc-libs installed)
│   └── lib/                 # (empty until pcc-libs installed)
└── share/man/man1/
    ├── pcc.1
    ├── pcpp.1
    ├── cpp.1
    └── ccom.1
```

### Step 1.4: Verify Stage 1

```bash
# Check version
/home/user/pcc-stage1/bin/pcc --version
# Output: Portable C Compiler 1.2.0.DEVEL 20231021 for x86_64-pc-linux-gnu

# Quick test (won't link until pcc-libs is installed)
echo 'int main() { return 0; }' | /home/user/pcc-stage1/bin/pcc -x c -S -o - -
# Should output assembly code
```

---

## Building PCC-LIBS

### Step 2.1: Configure

```bash
cd pcc-libs

# Use the pcc we just built
./configure --prefix=/home/user/pcc-stage1 \
    CC=/home/user/pcc-stage1/bin/pcc
```

**Important**: We use `CC=.../pcc` so pcc-libs is compiled with pcc, not gcc. This is part of the bootstrapping process.

### Step 2.2: Build

```bash
make
```

#### What Gets Built

1. **libsoftfloat** (software floating-point):
   ```bash
   pcc -O -c bits64/softfloat.c
   pcc -O -c fpgetround.c
   # ... more files ...
   ar r libpccsoftfloat.a *.o
   ranlib libpccsoftfloat.a
   ```

2. **libpcc** (runtime library):
   ```bash
   pcc -O -c muldi3.c
   pcc -O -c divdi3.c
   pcc -O -c cxmuldiv.c
   # ... more files ...
   ar r libpcc.a *.o
   ranlib libpcc.a
   ```

3. **csu** (startup code):
   ```bash
   pcc -O2 -c crtbegin.c
   pcc -O2 -c crtend.c
   pcc -O2 -fpic -c -o crtbeginS.o crtbegin.c
   pcc -O2 -fpic -c -o crtendS.o crtend.c
   pcc -O2 -c -o crtbeginT.o crtbegin.c
   pcc -O2 -c -o crtendT.o crtend.c
   ```

### Step 2.3: Install

```bash
make install
```

#### Installed Files

```
/home/user/pcc-stage1/lib/pcc/x86_64-pc-linux-gnu/1.2.0.DEVEL/
├── include/
│   ├── float.h              # Floating-point characteristics
│   ├── iso646.h             # Alternative operators (<%, %>, etc.)
│   ├── libpcc_float.h       # Internal float definitions
│   ├── libpcc_limits.h      # Internal limits definitions
│   ├── libpcc_stdarg.h      # Internal stdarg definitions
│   ├── libpcc_stdbool.h     # Internal stdbool definitions
│   ├── libpcc_stddef.h      # Internal stddef definitions
│   ├── limits.h             # Integer limits
│   ├── stdarg.h             # Variable argument handling
│   ├── stdbool.h            # Boolean type
│   └── stddef.h             # Standard definitions (size_t, NULL, etc.)
└── lib/
    ├── crtbegin.o           # Constructor support (static)
    ├── crtbeginS.o          # Constructor support (shared)
    ├── crtbeginT.o          # Constructor support (static exec)
    ├── crtend.o             # Destructor support (static)
    ├── crtendS.o            # Destructor support (shared)
    ├── crtendT.o            # Destructor support (static exec)
    ├── libpcc.a             # Runtime library
    └── libpccsoftfloat.a    # Software float library
```

### Step 2.4: Test Complete Stage 1

```bash
# Now we can compile and link a complete program
echo '#include <stdio.h>
int main() {
    printf("Hello from PCC Stage 1!\n");
    return 0;
}' > /tmp/hello.c

/home/user/pcc-stage1/bin/pcc -o /tmp/hello /tmp/hello.c
/tmp/hello
# Output: Hello from PCC Stage 1!
```

---

## Stage 2: Building PCC with PCC

Now we rebuild pcc using the pcc we just built. This is the key bootstrapping step.

### Step 3.1: Clean Previous Build

```bash
cd pcc
make distclean
```

This removes:
- All compiled object files (`.o`)
- Generated files (`cgram.c`, `scan.c`, `external.c`)
- Generated Makefiles
- `config.h`

### Step 3.2: Configure with PCC

```bash
./configure --prefix=/home/user/pcc-stage2 \
    CC=/home/user/pcc-stage1/bin/pcc
```

**Critical**: The `CC=` specifies that pcc (not gcc) should compile everything.

### Step 3.3: Build with PCC

```bash
make
```

You'll see pcc compiling itself:
```
/home/user/pcc-stage1/bin/pcc -g -O2 -Wall ... -c -o cc.o ./cc.c
/home/user/pcc-stage1/bin/pcc -g -O2 -Wall ... -c -o compat.o compat.c
...
/home/user/pcc-stage1/bin/pcc cc.o compat.o strlist.o xalloc.o -o cc -lm
```

**Note**: You may see warnings like:
```
warning: conversion from 'long' to 'int' may alter its value
```
These are due to pcc's stricter `-Wtruncate` flag and are generally harmless on 64-bit systems.

### Step 3.4: Install Stage 2

```bash
make install
```

### Step 3.5: Build and Install PCC-LIBS for Stage 2

```bash
cd pcc-libs
make distclean
./configure --prefix=/home/user/pcc-stage2 \
    CC=/home/user/pcc-stage1/bin/pcc
make
make install
```

### Step 3.6: Verify Stage 2

```bash
/home/user/pcc-stage2/bin/pcc --version
/home/user/pcc-stage2/bin/pcc -o /tmp/hello2 /tmp/hello.c
/tmp/hello2
```

### Comparing Stage 1 and Stage 2

```bash
# Size comparison
ls -la /home/user/pcc-stage1/libexec/
ls -la /home/user/pcc-stage2/libexec/

# Typical results:
# Stage 1 (gcc-compiled):  ccom ~500KB, cpp ~64KB
# Stage 2 (pcc-compiled):  ccom ~390KB, cpp ~48KB
# PCC produces smaller binaries!
```

---

## Stage 3: Verifying Self-Consistency

The final verification is to build pcc with stage 2 and confirm it produces identical output.

### Step 4.1: Build Stage 3

```bash
cd pcc
make distclean
./configure --prefix=/home/user/pcc-stage3 \
    CC=/home/user/pcc-stage2/bin/pcc
make
```

### Step 4.2: Compare Binaries

The stage 2 and stage 3 binaries should be identical (when stripped):

```bash
# Direct comparison (may differ due to debug symbols)
cmp /home/user/pcc-stage2/libexec/ccom /home/user/pcc/cc/ccom/ccom

# Compare stripped binaries (should be IDENTICAL)
strip -o /tmp/ccom2 /home/user/pcc-stage2/libexec/ccom
strip -o /tmp/ccom3 /home/user/pcc/cc/ccom/ccom
cmp /tmp/ccom2 /tmp/ccom3 && echo "IDENTICAL!" || echo "DIFFERENT!"

strip -o /tmp/cpp2 /home/user/pcc-stage2/libexec/cpp
strip -o /tmp/cpp3 /home/user/pcc/cc/cpp/cpp
cmp /tmp/cpp2 /tmp/cpp3 && echo "IDENTICAL!" || echo "DIFFERENT!"
```

**Expected Result**: Both comparisons should print "IDENTICAL!"

### What This Proves

If Stage 2 == Stage 3:
1. **Determinism**: PCC produces identical output for identical input
2. **Correctness**: PCC compiles C code correctly (at least its own code)
3. **Completeness**: PCC implements enough of C to compile a compiler
4. **No Hidden Dependencies**: No gcc-specific behavior is required

---

## Using PCC Without System Installation

You can use pcc from any directory without installing to system paths.

### Option 1: Use Installed PCC with Full Paths

```bash
/path/to/pcc-stage2/bin/pcc -o output input.c
```

### Option 2: Add to PATH

```bash
export PATH="/path/to/pcc-stage2/bin:$PATH"
pcc -o output input.c
```

### Option 3: Portable PCC Directory

Create a self-contained directory that can be moved anywhere:

#### Directory Structure

```
portable-pcc/
├── bin/
│   ├── pcc              # Driver binary
│   └── pcc-portable     # Wrapper script (see below)
├── include/
│   ├── stddef.h
│   ├── stdarg.h
│   ├── stdbool.h
│   ├── float.h
│   ├── limits.h
│   └── iso646.h
└── lib/
    ├── cpp              # Preprocessor
    ├── ccom             # Compiler
    ├── crtbegin.o
    ├── crtbeginS.o
    ├── crtbeginT.o
    ├── crtend.o
    ├── crtendS.o
    ├── crtendT.o
    ├── libpcc.a
    └── libpccsoftfloat.a
```

#### Creating the Portable Directory

```bash
# Create structure
mkdir -p portable-pcc/{bin,lib,include}

# Copy binaries
cp pcc-stage2/bin/pcc portable-pcc/bin/
cp pcc-stage2/libexec/cpp portable-pcc/lib/
cp pcc-stage2/libexec/ccom portable-pcc/lib/

# Copy runtime
cp pcc-stage2/lib/pcc/*/lib/*.o portable-pcc/lib/
cp pcc-stage2/lib/pcc/*/lib/*.a portable-pcc/lib/
cp pcc-stage2/lib/pcc/*/include/*.h portable-pcc/include/
```

#### The Wrapper Script

Create `portable-pcc/bin/pcc-portable`:

```bash
#!/bin/bash
# Portable PCC wrapper - finds paths relative to script location

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PCC_ROOT="$(dirname "$SCRIPT_DIR")"

exec "$SCRIPT_DIR/pcc" \
    -B"$PCC_ROOT/lib/" \
    -isystem "$PCC_ROOT/include/" \
    -L"$PCC_ROOT/lib/" \
    "$@"
```

Make it executable:
```bash
chmod +x portable-pcc/bin/pcc-portable
```

#### Using the Portable PCC

```bash
# Direct invocation with flags
portable-pcc/bin/pcc -B./portable-pcc/lib/ \
    -isystem ./portable-pcc/include/ \
    -L./portable-pcc/lib/ \
    -o hello hello.c

# Or using the wrapper
portable-pcc/bin/pcc-portable -o hello hello.c
```

#### Command-Line Flags Explained

| Flag | Purpose |
|------|---------|
| `-B<dir>` | Add directory to search path for cpp, ccom, and crt*.o files |
| `-isystem <dir>` | Add directory to system include search path |
| `-L<dir>` | Add directory to library search path |
| `-I<dir>` | Add directory to user include search path |

---

## Troubleshooting

### Configure Fails: "C compiler cannot create executables"

**Cause**: When using `CC=pcc`, pcc can't find its components.

**Solution**: Ensure pcc is properly installed with pcc-libs:
```bash
# Verify pcc works
$CC --version
echo 'int main(){}' | $CC -x c - -o /tmp/test && echo "OK"
```

### Error: "cannot find 'stddef.h'"

**Cause**: pcc-libs headers not installed or not in search path.

**Solution**:
```bash
# If installed, check the path
ls /path/to/pcc/lib/pcc/*/include/

# If using portable pcc, add -isystem
pcc -isystem /path/to/include/ ...
```

### Error: "ld: cannot find -lpcc"

**Cause**: libpcc.a not in library search path.

**Solution**:
```bash
# Add library path
pcc -L/path/to/lib/ ...
```

### Error: "cannot find 'cpp'" or "cannot find 'ccom'"

**Cause**: Backend programs not in expected location.

**Solution**:
```bash
# Use -B to specify location
pcc -B/path/to/lib/ ...

# Check where pcc expects them
strings $(which pcc) | grep libexec
```

### Bison/Flex Errors During Build

**Cause**: bison or flex not installed or wrong version.

**Solution**:
```bash
# Install correct versions
sudo apt-get install bison flex

# Check versions
bison --version  # Need 2.x or 3.x
flex --version   # Need 2.5+
```

### Stage 2 ≠ Stage 3 (Not Identical)

**Possible Causes**:
1. Debug symbols differ (use `strip` before comparing)
2. Build timestamps embedded in binary
3. Non-deterministic code generation (rare)

**Solution**:
```bash
# Always compare stripped binaries
strip -o /tmp/a binary1
strip -o /tmp/b binary2
cmp /tmp/a /tmp/b
```

---

## Reference

### PCC Command-Line Options

| Option | Description |
|--------|-------------|
| `-c` | Compile only, don't link |
| `-S` | Compile to assembly only |
| `-E` | Preprocess only |
| `-o file` | Output file name |
| `-O` | Enable optimization |
| `-O2` | More optimization |
| `-g` | Generate debug information |
| `-W...` | Warning options |
| `-Wall` | Enable all warnings |
| `-I dir` | Add include search path |
| `-L dir` | Add library search path |
| `-l lib` | Link with library |
| `-D name` | Define preprocessor macro |
| `-D name=val` | Define macro with value |
| `-U name` | Undefine macro |
| `-B dir` | Add search path for backends |
| `-isystem dir` | Add system include path |
| `-x lang` | Specify input language (c, c++, assembler) |
| `-std=c99` | Use C99 standard |
| `-fpic` | Generate position-independent code |
| `-fPIC` | Generate PIC (large model) |
| `-static` | Static linking |
| `-shared` | Create shared library |
| `-v` | Verbose mode |
| `--version` | Print version |
| `-print-search-dirs` | Show search paths |
| `-print-prog-name=X` | Show path to program X |
| `-print-file-name=X` | Show path to file X |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CC` | Default C compiler |
| `CFLAGS` | Default C compiler flags |
| `CPPFLAGS` | Default preprocessor flags |
| `LDFLAGS` | Default linker flags |

### Important Source Files

| File | Purpose |
|------|---------|
| `cc/cc/cc.c` | Main driver - parses args, invokes stages |
| `cc/cpp/cpp.c` | Preprocessor main |
| `cc/ccom/cgram.y` | C grammar (Bison input) |
| `cc/ccom/scan.l` | Lexical scanner (Flex input) |
| `cc/ccom/trees.c` | AST construction |
| `cc/ccom/pftn.c` | Parse tree functions |
| `arch/amd64/code.c` | x86-64 code generation |
| `arch/amd64/table.c` | x86-64 instruction patterns |
| `mip/regs.c` | Register allocator |

### Resources

- **Official Website**: http://pcc.ludd.ltu.se/
- **Mailing List**: pcc@lists.ludd.ltu.se
- **GitHub (PortableCC)**: https://github.com/PortableCC
- **Wikipedia**: https://en.wikipedia.org/wiki/Portable_C_Compiler

---

## Appendix: Complete Build Script

```bash
#!/bin/bash
# Complete PCC bootstrap script
set -e

PREFIX="${PREFIX:-$HOME/pcc-install}"
STAGE1="$PREFIX-stage1"
STAGE2="$PREFIX-stage2"
STAGE3="$PREFIX-stage3"

echo "=== Installing dependencies ==="
sudo apt-get update
sudo apt-get install -y build-essential bison flex git

echo "=== Cloning repositories ==="
git clone https://github.com/PortableCC/pcc.git || true
git clone https://github.com/PortableCC/pcc-libs.git || true

echo "=== Stage 1: Building PCC with GCC ==="
cd pcc
./configure --prefix="$STAGE1"
make
make install

cd ../pcc-libs
./configure --prefix="$STAGE1" CC="$STAGE1/bin/pcc"
make
make install

echo "=== Testing Stage 1 ==="
echo 'int main(){return 0;}' | "$STAGE1/bin/pcc" -x c - -o /tmp/test1
echo "Stage 1 OK"

echo "=== Stage 2: Building PCC with PCC ==="
cd ../pcc
make distclean
./configure --prefix="$STAGE2" CC="$STAGE1/bin/pcc"
make
make install

cd ../pcc-libs
make distclean
./configure --prefix="$STAGE2" CC="$STAGE1/bin/pcc"
make
make install

echo "=== Testing Stage 2 ==="
echo 'int main(){return 0;}' | "$STAGE2/bin/pcc" -x c - -o /tmp/test2
echo "Stage 2 OK"

echo "=== Stage 3: Verifying Self-Consistency ==="
cd ../pcc
make distclean
./configure --prefix="$STAGE3" CC="$STAGE2/bin/pcc"
make

# Compare stripped binaries
strip -o /tmp/ccom2 "$STAGE2/libexec/ccom"
strip -o /tmp/ccom3 cc/ccom/ccom
if cmp -s /tmp/ccom2 /tmp/ccom3; then
    echo "SUCCESS: Stage 2 and Stage 3 are IDENTICAL!"
else
    echo "WARNING: Stage 2 and Stage 3 differ"
    exit 1
fi

echo "=== Bootstrap Complete ==="
echo "PCC is installed at: $STAGE2"
echo "Run: $STAGE2/bin/pcc --version"
```

Save as `bootstrap-pcc.sh` and run with:
```bash
chmod +x bootstrap-pcc.sh
./bootstrap-pcc.sh
```

---

*Document generated from practical bootstrapping session. Last updated: 2024*
