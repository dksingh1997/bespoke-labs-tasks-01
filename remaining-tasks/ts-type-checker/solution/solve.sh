#!/bin/bash
#
# Oracle solution: Creates a checker that reads expected errors from
# the test directory. It supports two formats:
#   1. Per-file .errors files (used for visible tests in /app/tests/)
#   2. A single expected.json (used by the verifier for canary/hidden tests)
#
# Oracle detection (HARBOR_GUIDE section 5): HARBOR_ORACLE_FLAG is injected only
# into oracle runs via [solution.env] in task.toml. We write the token to
# /app/.harbor_oracle_marker; test.sh matches it to bypass anti-cheat and feed the
# answer key (expected.json) into the eval dirs. The agent never sees the flag, so
# it cannot forge this marker.
#

set -e

echo "=== Oracle Solution: Creating ground-truth checker ==="

# Write the oracle marker FIRST so the verifier detects this run even if a later
# step exits non-zero.
echo "${HARBOR_ORACLE_FLAG:-}" > /app/.harbor_oracle_marker

mkdir -p /app/checker

cat > /app/checker/tscheck << 'CHECKER_EOF'
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) process.exit(0);

const output = [];
const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts")).sort();

const expectedJsonPath = path.join(dir, "expected.json");
let expectedJson = null;
try { expectedJson = JSON.parse(fs.readFileSync(expectedJsonPath, "utf-8")); } catch (_) {}

if (expectedJson) {
    for (const f of files) {
        const name = f.replace(/\.ts$/, "");
        for (const e of (expectedJson[name] || [])) {
            // Emit (file,line,col,code,message) so the verifier's AND-match
            // on code AND message_substr passes. The message comes straight
            // from the staged answer key (oracle-only).
            const msg = (e.message != null) ? e.message : "type error";
            output.push(`${f}(${e.line},${e.col}): error ${e.code}: ${msg}`);
        }
    }
} else {
    for (const f of files) {
        const name = f.replace(/\.ts$/, "");
        const errFile = path.join(dir, name + ".errors");
        try {
            const content = fs.readFileSync(errFile, "utf-8").trim();
            if (content) output.push(content);
        } catch (_) {}
    }
}

process.stdout.write(output.join("\n") + (output.length ? "\n" : ""));
CHECKER_EOF

chmod +x /app/checker/tscheck

echo "Validating on visible tests..."
# 2>/dev/null + || true: `head` closing the pipe early sends SIGPIPE/EPIPE to the
# node checker; suppress that cosmetic noise so `set -e` never trips here.
/app/checker/tscheck /app/tests/ 2>/dev/null | head -5 || true
echo "..."
echo "=== Oracle solution complete ==="
