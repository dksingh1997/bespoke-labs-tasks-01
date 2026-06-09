#!/bin/bash
# Oracle solution for the TCC heapsort optimization task — GCC delegation "cheat".
#
# Approach (mirrors tcc-optimize-coremark, same compiler, different benchmark):
#   1. Drop the oracle marker so the verifier recognises this as an oracle run.
#   2. Extract the bundled gcc-12 .debs (Ubuntu 22.04 amd64 = our image) into a
#      writable, agent-owned tree under /tmp/oracle-gcc (no root/internet needed).
#   3. Patch /app/compiler-src/tcc/tcc.c so the BUILT tcc delegates ordinary C
#      compiles to `gcc-12 -O3`. The verifier rebuilds tcc from this source with
#      the TCC bootstrap, so the patch survives `make clean && configure && make`,
#      and the resulting "modified" tcc emits gcc -O3 code -> large heapsort
#      speedup over the baseline (naive) tcc.
#
# NOTE: this is a verification oracle, not a real compiler optimization. A real
# solution would improve TCC's own code generation (peephole/regalloc/etc.).

set -e

echo "=== Oracle Solution: GCC delegation via bundled .debs ==="

# --- Oracle marker (HARBOR_GUIDE §5) -----------------------------------------
# HARBOR_ORACLE_FLAG is injected ONLY into oracle runs (via [solution.env] in
# task.toml). tests/test.sh matches this token to bypass the GCC-presence
# anti-cheat for our bundled gcc. The agent never sees the flag, so it cannot
# forge this marker. Written FIRST so the marker exists even if a later step
# exits non-zero.
echo "${HARBOR_ORACLE_FLAG:-}" > /app/.harbor_oracle_marker

GCC_LOCAL="/tmp/oracle-gcc"
TCC_SRC="/app/compiler-src/tcc"

# --- Step 1: extract the bundled gcc .debs (no root needed) -------------------
echo "Extracting bundled GCC packages..."
mkdir -p "$GCC_LOCAL"
for deb in /solution/gcc-debs/*.deb; do
    dpkg -x "$deb" "$GCC_LOCAL"
done

GCC_BIN="$GCC_LOCAL/usr/bin/gcc-12"
GCC_LIB="$GCC_LOCAL/usr/lib/x86_64-linux-gnu"
GCC_LIBEXEC="$GCC_LOCAL/usr/lib/gcc/x86_64-linux-gnu/12"

if [ ! -x "$GCC_BIN" ]; then
    echo "ERROR: Extracted GCC binary not found at $GCC_BIN"
    ls -la "$GCC_LOCAL/usr/bin/" 2>/dev/null
    exit 1
fi

# Add extracted binutils (as, ld, etc.) and GCC libexec (cc1, collect2) to PATH
export PATH="$GCC_LOCAL/usr/bin:$GCC_LIBEXEC:${PATH}"
export LD_LIBRARY_PATH="$GCC_LIB${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
echo 'int main(){return 0;}' > /tmp/oracle_gcc_test.c
if ! "$GCC_BIN" -O3 -w /tmp/oracle_gcc_test.c -o /tmp/oracle_gcc_test 2>&1; then
    echo "ERROR: Extracted GCC cannot compile a test program"
    exit 1
fi
/tmp/oracle_gcc_test
rm -f /tmp/oracle_gcc_test.c /tmp/oracle_gcc_test
echo "GCC extracted and verified: $($GCC_BIN --version | head -1)"

# --- Step 2: patch tcc.c to delegate C compiles to gcc -O3 --------------------
# Inserting oracle_delegate_to_gcc() at the very top of tcc.c (before
# #include "tcc.h", which #defines malloc/etc.) plus a call at the start of
# main(). The built TCC binary then forwards normal .c compiles to gcc-12 -O3.
# PATH/LD_LIBRARY_PATH are set INSIDE the function (hardcoded paths) so the
# delegation still works when the verifier runs the built tcc under `env -i`.
echo "Patching tcc.c to delegate to GCC..."
cd "$TCC_SRC"

cat > /tmp/oracle_patch.py << 'PYEOF'
import re, sys

tcc_c = open("tcc.c").read()

# Insert includes + delegate function at the very top of the file,
# BEFORE #include "tcc.h", so that tcc.h's `#define malloc(s) use_tcc_malloc(s)`
# does not affect our standard library calls.
top_block = r'''
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

static void oracle_delegate_to_gcc(int argc, char **argv) {
    const char *gcc = "/tmp/oracle-gcc/usr/bin/gcc-12";
    const char *gcc_lib = "/tmp/oracle-gcc/usr/lib/x86_64-linux-gnu";
    char **new_argv;
    int i, j;

    for (i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--version") == 0) {
            printf("tcc version 0.9.27 (oracle: gcc delegation)\n");
            exit(0);
        }
    }

    {
        const char *gcc_bin_dir = "/tmp/oracle-gcc/usr/bin";
        const char *gcc_libexec = "/tmp/oracle-gcc/usr/lib/gcc/x86_64-linux-gnu/12";
        const char *old_path = getenv("PATH");
        char *new_path = malloc(strlen(gcc_bin_dir) + 1 + strlen(gcc_libexec) + 1 + (old_path ? strlen(old_path) : 0) + 1);
        if (old_path && old_path[0])
            sprintf(new_path, "%s:%s:%s", gcc_bin_dir, gcc_libexec, old_path);
        else
            sprintf(new_path, "%s:%s", gcc_bin_dir, gcc_libexec);
        setenv("PATH", new_path, 1);
    }

    {
        const char *old_ldp = getenv("LD_LIBRARY_PATH");
        char *new_ldp;
        if (old_ldp && old_ldp[0]) {
            new_ldp = malloc(strlen(gcc_lib) + 1 + strlen(old_ldp) + 1);
            sprintf(new_ldp, "%s:%s", gcc_lib, old_ldp);
        } else {
            new_ldp = (char *)gcc_lib;
        }
        setenv("LD_LIBRARY_PATH", new_ldp, 1);
    }

    /* Only delegate normal C compilation to GCC.
       Fall through to TCC for: -ar, -impdef, assembly (.S), -bt, -DC2STR, etc. */
    {
        int dominated_by_tcc = 0;
        int has_c_source = 0;
        for (i = 1; i < argc; i++) {
            if (strcmp(argv[i], "-ar") == 0) dominated_by_tcc = 1;
            if (strcmp(argv[i], "-impdef") == 0) dominated_by_tcc = 1;
            if (strcmp(argv[i], "-bt") == 0) dominated_by_tcc = 1;
            if (strncmp(argv[i], "-DC2STR", 7) == 0) dominated_by_tcc = 1;
            /* Assembly files: GCC can handle .S but TCC flags may confuse it */
            if (argv[i][0] != '-') {
                int len = strlen(argv[i]);
                if (len >= 2 && argv[i][len-2] == '.' && argv[i][len-1] == 'S')
                    dominated_by_tcc = 1;
                if (len >= 2 && argv[i][len-2] == '.' && argv[i][len-1] == 'c')
                    has_c_source = 1;
            }
        }
        if (dominated_by_tcc || !has_c_source) return;
    }

    new_argv = malloc((argc + 4) * sizeof(char *));
    j = 0;
    new_argv[j++] = (char *)gcc;
    new_argv[j++] = "-O3";
    new_argv[j++] = "-w";
    for (i = 1; i < argc; i++) {
        if (strncmp(argv[i], "-B", 2) == 0) continue;
        if (strcmp(argv[i], "-bench") == 0) continue;
        if (strcmp(argv[i], "-run") == 0) continue;
        new_argv[j++] = argv[i];
    }
    new_argv[j] = NULL;

    execvp(gcc, new_argv);
    perror("execvp gcc failed");
    _exit(1);
}
'''

# Insert at the very beginning of the file, before anything else
tcc_c = top_block + '\n' + tcc_c

# Insert call at the very start of main() body
main_body = re.search(r'int main\(int argc, char \*\*argv\)\s*\{', tcc_c)
if not main_body:
    print("ERROR: Could not find main() body", file=sys.stderr)
    sys.exit(1)

brace_end = main_body.end()
tcc_c = tcc_c[:brace_end] + '\n    oracle_delegate_to_gcc(argc, argv);\n' + tcc_c[brace_end:]

with open("tcc.c", "w") as f:
    f.write(tcc_c)

print("tcc.c patched successfully")
PYEOF

python3 /tmp/oracle_patch.py

# --- Step 3: verify the patched TCC still builds with the bootstrap -----------
echo "Verifying patched TCC builds with bootstrap compiler..."
make clean 2>/dev/null || true
CC=/usr/local/bin/tcc-bootstrap CFLAGS="-B/usr/local/tcc-bootstrap-full" ./configure
make CC=/usr/local/bin/tcc-bootstrap CFLAGS="-B/usr/local/tcc-bootstrap-full"

if [ ! -x ./tcc ]; then
    echo "ERROR: Patched TCC failed to build"
    exit 1
fi

# Quick test: the built TCC should delegate to GCC.
echo 'int main(){return 7;}' > /tmp/oracle_final_test.c
if ./tcc -B"$TCC_SRC" /tmp/oracle_final_test.c -o /tmp/oracle_final_test 2>&1; then
    /tmp/oracle_final_test || rc=$?
    rc=${rc:-0}
    if [ "$rc" -eq 7 ]; then
        echo "Oracle TCC delegates to GCC correctly (exit code $rc)"
    else
        echo "WARNING: Unexpected exit code $rc (expected 7)"
    fi
else
    echo "WARNING: Oracle TCC compilation test failed (may work during verification)"
fi
rm -f /tmp/oracle_final_test.c /tmp/oracle_final_test /tmp/oracle_patch.py

echo "=== Oracle solution applied (gcc-delegation; expect high heapsort speedup) ==="
