#!/bin/bash
set -euo pipefail

# Oracle marker: HARBOR_ORACLE_FLAG is injected only into oracle runs (via
# [solution.env] in task.toml). test.sh matches this token to skip the anti-cheat
# checks, since the oracle decrypts the baked oracle `ls` as its solution. The
# agent never sees the flag, so it cannot forge this marker.
echo "${HARBOR_ORACLE_FLAG:-}" > /app/.harbor_oracle_marker

# Decrypt the oracle ls binary and use it as our solution.
# The key matches what test.sh uses to decrypt for comparison.
DECRYPT_KEY="r5tL5_v3r1f1er_k3y_8f2a"

openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in /app/.test_data/oracle.enc \
    -pass pass:$DECRYPT_KEY \
    -out /app/workspace/rls

chmod +x /app/workspace/rls
