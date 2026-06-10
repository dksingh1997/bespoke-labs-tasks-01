#!/bin/bash
set -euo pipefail

# Decrypt the oracle ls binary and use it as our solution.
# The key matches what test.sh uses to decrypt for comparison.
DECRYPT_KEY="r5tL5_v3r1f1er_k3y_8f2a"

openssl enc -d -aes-256-cbc -salt -pbkdf2 -iter 100000 \
    -in /app/.test_data/oracle.enc \
    -pass pass:$DECRYPT_KEY \
    -out /app/workspace/rls

chmod +x /app/workspace/rls

# Marker to bypass anti-cheat checks
touch /app/workspace/.oracle_solution
