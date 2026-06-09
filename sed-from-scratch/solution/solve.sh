#!/bin/bash
set -e

# Oracle marker so the verifier skips anti-cheat source checks.
# HARBOR_ORACLE_FLAG is injected only into oracle runs (via [solution.env] in
# task.toml); compute_reward.py matches this token to skip the source gate. The
# agent never sees the flag, so it cannot forge this marker.
echo "${HARBOR_ORACLE_FLAG:-}" > /app/.harbor_oracle_marker

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
