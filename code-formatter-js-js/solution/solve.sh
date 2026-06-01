#!/bin/bash
#
# Oracle solution: Install Prettier and use it as the formatter backend.
# This produces the gold-standard output that the test suite expects.
#

set -e

echo "=== Oracle Solution: Installing Prettier as the formatter ==="

npm install -g prettier --quiet

cat > /app/formatter/main.js << 'JAVASCRIPT'
#!/usr/bin/env node
/**
 * Oracle formatter implementation using Prettier.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function formatCode(source, filepath = "") {
  const ext = path.extname(filepath);
  const parser = [".ts", ".tsx"].includes(ext) ? "typescript" : "babel";

  const result = execSync(
    `prettier --parser ${parser} --stdin-filepath "${filepath || 'input.js'}"`,
    { input: source, encoding: "utf-8" },
  );
  return result;
}

function main() {
  if (process.argv.length !== 4) {
    console.error(`Usage: ${process.argv[1]} <input_file> <output_file>`);
    process.exit(1);
  }

  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  const source = fs.readFileSync(inputPath, "utf-8");
  const formatted = formatCode(source, inputPath);
  fs.writeFileSync(outputPath, formatted);
}

main();
JAVASCRIPT

echo "=== Oracle solution installed ==="
echo "Verifying with a quick test..."

FIRST_CASE=$(ls -d /app/formatter/tests/cases/case_*/ | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    for ext in js ts jsx tsx; do
        if [ -f "$FIRST_CASE/input.$ext" ]; then
            node /app/formatter/main.js "$FIRST_CASE/input.$ext" /tmp/oracle_test_output.$ext
            if diff -q /tmp/oracle_test_output.$ext "$FIRST_CASE/expected_output.$ext" >/dev/null 2>&1; then
                echo "Sanity check PASSED ($CASE_NAME)"
            else
                echo "WARNING: Sanity check output differs ($CASE_NAME)"
            fi
            rm -f /tmp/oracle_test_output.$ext
            break
        fi
    done
fi

echo "=== Oracle solution complete ==="
