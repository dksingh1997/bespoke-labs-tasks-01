#!/bin/bash
# Oracle solution for the PCC optimization task: GCC delegation via bundled .debs.
#
# This is the PCC analog of the tcc-optimize-coremark reference oracle. PCC
# produces much slower code than GCC -O3, so to reach a high CoreMark speedup
# (reward ~1.0) the oracle patches PCC's compiler DRIVER (cc/cc/cc.c) so that
# the BUILT pcc binary delegates every C compile/link invocation to a bundled
# gcc-12 -O3. Because the patch lives in the PCC SOURCE TREE, it survives the
# verifier's `make distclean && configure && make` rebuild (the verifier always
# rebuilds PCC from /app/compiler-src/pcc with the pcc-bootstrap compiler).
#
# Mechanism (mirrors the tcc reference):
#   1. Write the oracle marker so tests/test.sh records this as an oracle run.
#   2. dpkg -x the bundled gcc-12 + binutils .debs into /tmp/oracle-gcc (no root).
#   3. Patch cc/cc/cc.c: insert a delegate function + a call at the very top of
#      main() that re-execs gcc-12 -O3 with the same user args (passing through
#      .c/.o/.S/-c/-o/-I/-D/-l/-L, stripping pcc-only / -O* flags) and sets
#      PATH + LD_LIBRARY_PATH internally so it survives the verifier's `env -i`.
#   4. Rebuild PCC with the bootstrap to confirm the patched driver compiles.
#   5. Quick-test that the built pcc delegates to gcc (a program returning 7).
#
# GCC accepts cc-style args and links its own runtime, so pcc-libs is NOT needed
# on the oracle path; only the gcc tree under /tmp/oracle-gcc is required.

set -e

# === Step 1: Oracle marker (HARBOR_GUIDE §5) ===========================
# HARBOR_ORACLE_FLAG is injected ONLY into oracle runs via [solution.env] in
# task.toml. tests/test.sh matches this token (EXPECTED_ORACLE_FLAG) to record
# the run as an oracle. The agent never sees the flag, so it cannot forge this
# marker. Written FIRST so the marker exists even if a later step hits an issue.
echo "${HARBOR_ORACLE_FLAG:-}" > /app/.harbor_oracle_marker

echo "=== Oracle Solution: PCC -> GCC -O3 delegation via bundled .debs ==="

GCC_LOCAL="/tmp/oracle-gcc"
PCC_SRC="/app/compiler-src/pcc"
PCC_DRIVER="$PCC_SRC/cc/cc/cc.c"
BOOT="/usr/local/bin/pcc-bootstrap"

# === Step 2: Extract the bundled GCC .deb packages (no root needed) =====
echo "Extracting bundled GCC packages into $GCC_LOCAL ..."
rm -rf "$GCC_LOCAL"
mkdir -p "$GCC_LOCAL"
for deb in /solution/gcc-debs/*.deb; do
    dpkg -x "$deb" "$GCC_LOCAL"
done

GCC_BIN="$GCC_LOCAL/usr/bin/gcc-12"
GCC_LIB="$GCC_LOCAL/usr/lib/x86_64-linux-gnu"
GCC_LIBEXEC="$GCC_LOCAL/usr/lib/gcc/x86_64-linux-gnu/12"

if [ ! -x "$GCC_BIN" ]; then
    echo "ERROR: Extracted GCC binary not found at $GCC_BIN"
    ls -la "$GCC_LOCAL/usr/bin/" 2>/dev/null || true
    exit 1
fi

# === Step 3: Verify the extracted GCC works =============================
# cc1/as/ld/collect2 live under the extracted bin + libexec; shared libs under
# the extracted libdir. Make them reachable for this verification compile.
export PATH="$GCC_LOCAL/usr/bin:$GCC_LIBEXEC:${PATH}"
export LD_LIBRARY_PATH="$GCC_LIB${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
echo 'int main(){return 0;}' > /tmp/oracle_gcc_test.c
if ! "$GCC_BIN" -O3 -w /tmp/oracle_gcc_test.c -o /tmp/oracle_gcc_test 2>&1; then
    echo "ERROR: Extracted GCC cannot compile a test program"
    exit 1
fi
/tmp/oracle_gcc_test
rm -f /tmp/oracle_gcc_test.c /tmp/oracle_gcc_test
echo "GCC extracted and verified: $("$GCC_BIN" --version | head -1)"

# === Step 4: Patch the PCC driver (cc/cc/cc.c) to delegate to gcc-12 ====
# The driver's main() is where pcc orchestrates cpp/ccom/as/ld. We insert a
# delegate function just before main() and call it at the very start of main(),
# so the BUILT pcc re-execs gcc-12 -O3 for the whole invocation.
echo "Patching driver $PCC_DRIVER to delegate to gcc-12 -O3 ..."
if [ ! -f "$PCC_DRIVER" ]; then
    echo "ERROR: PCC driver source not found at $PCC_DRIVER"
    exit 1
fi

cat > /tmp/oracle_patch.py << 'PYEOF'
import re, sys

path = "/app/compiler-src/pcc/cc/cc/cc.c"
src = open(path).read()

MARKER = "oracle_delegate_to_gcc"
if MARKER in src:
    print("cc.c already patched; skipping.")
    sys.exit(0)

# Delegate function: inserted right before main(). It uses only plain libc
# (declared by cc.c's own <stdio.h>/<stdlib.h>/<string.h>/<unistd.h> includes;
# pcc's headers do NOT redefine these), static buffers (no malloc), and re-execs
# gcc-12 -O3. PATH/LD_LIBRARY_PATH are set inside the function so delegation
# works even when the verifier runs the build under `env -i`.
delegate = r'''
/* ===== ORACLE GCC-DELEGATION (injected by solution/solve.sh) ===========
 * Makes the built pcc driver re-exec a bundled gcc-12 -O3 for the entire
 * invocation (compile AND link). Inert unless /tmp/oracle-gcc exists, so a
 * normal (unpatched) source tree is unaffected; here it is always present on
 * the oracle path. gcc accepts cc-style args and links its own runtime. */
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

static void
oracle_delegate_to_gcc(int argc, char **argv)
{
	static const char *gcc        = "/tmp/oracle-gcc/usr/bin/gcc-12";
	static const char *gcc_bindir = "/tmp/oracle-gcc/usr/bin";
	static const char *gcc_libexc = "/tmp/oracle-gcc/usr/lib/gcc/x86_64-linux-gnu/12";
	static const char *gcc_libdir = "/tmp/oracle-gcc/usr/lib/x86_64-linux-gnu";
	static char pathbuf[16384];
	static char ldbuf[16384];
	static char *nv[8192];
	const char *oldp;
	int i, j;

	/* Only delegate when the bundled gcc is present (oracle path). */
	if (access(gcc, X_OK) != 0)
		return;

	/* Make --version succeed without invoking gcc machinery. */
	for (i = 1; i < argc; i++) {
		if (strcmp(argv[i], "--version") == 0) {
			printf("pcc (oracle: gcc-12 -O3 delegation)\n");
			fflush(stdout);
			_exit(0);
		}
	}

	/* PATH so gcc finds cc1/as/ld/collect2 even under env -i. */
	oldp = getenv("PATH");
	if (oldp && oldp[0])
		snprintf(pathbuf, sizeof(pathbuf), "%s:%s:%s", gcc_bindir, gcc_libexc, oldp);
	else
		snprintf(pathbuf, sizeof(pathbuf), "%s:%s", gcc_bindir, gcc_libexc);
	setenv("PATH", pathbuf, 1);

	/* LD_LIBRARY_PATH so gcc's own shared libs (libisl, libmpc, ...) load. */
	oldp = getenv("LD_LIBRARY_PATH");
	if (oldp && oldp[0])
		snprintf(ldbuf, sizeof(ldbuf), "%s:%s", gcc_libdir, oldp);
	else
		snprintf(ldbuf, sizeof(ldbuf), "%s", gcc_libdir);
	setenv("LD_LIBRARY_PATH", ldbuf, 1);

	/* gcc -O3 (+ conservative UB flags) -w <user args, minus -O* and
	 * pcc-only driver flags>. The extra flags keep -O3 CoreMark speed while
	 * matching PCC's UB tolerance so the gcc.c-torture correctness suite does
	 * NOT regress: -fwrapv (signed overflow wraps) and -fno-strict-aliasing
	 * fix the signed-overflow/type-pun execute tests; -fno-aggressive-loop-
	 * optimizations / -fno-unswitch-loops / -fno-loop-unroll-and-jam avoid a
	 * known gcc-12 -O3 miscompile of a VLA torture test (20221006-1). These
	 * are strictly more conservative, so they can only make more tests pass. */
	j = 0;
	nv[j++] = (char *)gcc;
	nv[j++] = (char *)"-O3";
	nv[j++] = (char *)"-fwrapv";
	nv[j++] = (char *)"-fno-strict-aliasing";
	nv[j++] = (char *)"-fno-aggressive-loop-optimizations";
	nv[j++] = (char *)"-fno-unswitch-loops";
	nv[j++] = (char *)"-fno-loop-unroll-and-jam";
	nv[j++] = (char *)"-w";
	for (i = 1; i < argc && j < (int)(sizeof(nv) / sizeof(nv[0])) - 1; i++) {
		char *a = argv[i];
		/* Drop user optimization flags so our -O3 always wins. */
		if (a[0] == '-' && a[1] == 'O')
			continue;
		/* Strip pcc-only driver flags gcc does not understand. */
		if (strcmp(a, "-Wc,-fno-builtin") == 0)
			continue;
		nv[j++] = a;
	}
	nv[j] = NULL;

	execv(gcc, nv);
	perror("oracle: execv gcc-12 failed");
	_exit(127);
}
/* ===== END ORACLE GCC-DELEGATION ===================================== */

'''

# 1) Insert the delegate function immediately before the driver's main().
anchor = "int\nmain(int argc, char *argv[])\n{"
idx = src.find(anchor)
if idx < 0:
    print("ERROR: could not locate main() definition in cc.c", file=sys.stderr)
    sys.exit(1)
src = src[:idx] + delegate + src[idx:]

# 2) Insert the call as the FIRST STATEMENT of main(), placed AFTER the local
#    declarations (the first statement is "lav = argv;"). Keeping it after the
#    declarations stays valid under strict C90, which forbids a statement before
#    declarations in a block (pcc may compile in such a mode).
stmt_anchor = "\n\tlav = argv;"
sidx = src.find(stmt_anchor)
if sidx < 0:
    print("ERROR: could not locate main() body anchor (lav = argv;)",
          file=sys.stderr)
    sys.exit(1)
new_src = src[:sidx] + "\n\toracle_delegate_to_gcc(argc, argv);" + src[sidx:]

with open(path, "w") as f:
    f.write(new_src)

print("cc.c patched: delegate function + call inserted at main().")
PYEOF

python3 /tmp/oracle_patch.py

# === Step 5: Rebuild patched PCC with the bootstrap (proves it compiles) =
echo "Rebuilding patched PCC with the bootstrap compiler ..."
ORACLE_PREFIX=/tmp/oracle-install
rm -rf "$ORACLE_PREFIX"
mkdir -p "$ORACLE_PREFIX"

# Restore exec bits on autotools scripts (transfers/git can drop them -> 126).
restore_bits() {
    find . -type f \( -name configure -o -name config.sub -o -name config.guess \
      -o -name install-sh -o -name missing -o -name depcomp -o -name ylwrap \
      -o -name compile -o -name mkinstalldirs -o -name '*.sh' \) \
      -exec chmod +x {} + 2>/dev/null || true
}

cd "$PCC_SRC"
restore_bits
make distclean 2>/dev/null || true
CC="$BOOT" ./configure --prefix="$ORACLE_PREFIX"
make CC="$BOOT"
make install

if [ ! -x "$ORACLE_PREFIX/bin/pcc" ]; then
    echo "ERROR: patched PCC failed to build/install"
    exit 1
fi

# === Step 6: Confirm the built pcc delegates to gcc (program returns 7) ==
echo "Verifying the built pcc delegates to gcc-12 ..."
echo 'int main(){return 7;}' > /tmp/oracle_final_test.c
rc=0
"$ORACLE_PREFIX/bin/pcc" -O /tmp/oracle_final_test.c -o /tmp/oracle_final_test 2>&1 || rc=$?
if [ "$rc" -ne 0 ]; then
    echo "WARNING: oracle pcc compile returned rc=$rc (may still work in verifier)"
else
    rc=0
    /tmp/oracle_final_test || rc=$?
    if [ "$rc" -eq 7 ]; then
        echo "Oracle pcc delegates to gcc correctly (program returned $rc)."
    else
        echo "WARNING: unexpected exit code $rc (expected 7)."
    fi
fi
rm -f /tmp/oracle_final_test.c /tmp/oracle_final_test /tmp/oracle_patch.py

echo "=== Oracle solution applied (pcc now delegates to gcc-12 -O3) ==="
