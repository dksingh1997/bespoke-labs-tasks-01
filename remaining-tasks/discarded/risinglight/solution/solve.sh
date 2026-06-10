#!/bin/bash
set -e

echo "=== Cloning RisingLight repository ==="
git clone --depth 1 https://github.com/risinglightdb/risinglight.git /tmp/risinglight

echo "=== Installing oracle solution ==="
cd /app

# Replace scaffold with the real RisingLight source
# Remove existing dirs first to avoid cp -r nesting (src/src/)
rm -rf /app/src /app/proto /app/.cargo
cp -r /tmp/risinglight/src /app/src
cp -r /tmp/risinglight/proto /app/proto
cp -r /tmp/risinglight/.cargo /app/.cargo
cp /tmp/risinglight/Cargo.toml /app/Cargo.toml
cp /tmp/risinglight/Cargo.lock /app/Cargo.lock
cp /tmp/risinglight/build.rs /app/build.rs
cp /tmp/risinglight/rust-toolchain /app/rust-toolchain
cp /tmp/risinglight/clippy.toml /app/clippy.toml 2>/dev/null || true

# Replace test runner with the real one (compatible with real source)
cp /tmp/risinglight/tests/sqllogictest.rs /app/tests/sqllogictest.rs

# The real Cargo.toml references test/bench targets we don't have
# (sqlplannertest, e2e, array, tpch). Strip them to avoid cargo errors.
python3 << 'PYEOF'
import re

with open("/app/Cargo.toml") as f:
    content = f.read()

# Remove [[test]] entries except sqllogictest
content = re.sub(
    r'\[\[test\]\]\nname = "(?!sqllogictest")[^"]*"\nharness = false\n*',
    '', content
)

# Remove all [[bench]] entries
content = re.sub(
    r'\[\[bench\]\]\n(?:(?!\[)[^\n]*\n)*\n*',
    '', content
)

# Clean up multiple consecutive blank lines
content = re.sub(r'\n{3,}', '\n\n', content)

with open("/app/Cargo.toml", "w") as f:
    f.write(content)
PYEOF

echo "Cargo.toml cleaned (removed unused test/bench targets)."

# Clean up
rm -rf /tmp/risinglight

echo "Oracle solution installed."
