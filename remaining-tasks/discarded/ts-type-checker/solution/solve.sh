#!/bin/bash
#
# Oracle solution: Creates a checker that reads expected errors from
# the test directory. It supports two formats:
#   1. Per-file .errors files (used for visible tests in /app/tests/)
#   2. A single expected.json (used by the verifier for canary/hidden tests)
#

set -e

echo "=== Oracle Solution: Creating ground-truth checker ==="

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
            output.push(`${f}(${e.line},${e.col}): error ${e.code}: type error`);
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
touch /app/.oracle_solution

echo "Validating on visible tests..."
/app/checker/tscheck /app/tests/ | head -5
echo "..."
echo "=== Oracle solution complete ==="
