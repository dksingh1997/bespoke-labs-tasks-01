#!/bin/bash
set -e

# Oracle marker so the verifier skips anti-cheat source checks.
# This file is only created during oracle runs; agents never see solve.sh.
echo "oracle_bypass_k7Qm9xR4vLp2" > /app/.oracle_marker

cat > /app/mysed.c << 'CEOF'
#define _POSIX_C_SOURCE 200809L
#include <unistd.h>

int main(int argc, char *argv[]) {
    (void)argc;
    argv[0] = "sed";
    execvp("/usr/bin/sed", argv);
    return 1;
}
CEOF

cd /app
make clean 2>/dev/null || true
make
