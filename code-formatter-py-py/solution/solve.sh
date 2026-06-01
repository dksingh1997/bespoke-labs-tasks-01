#!/bin/bash
#
# Oracle solution: Use black as the formatter backend.
# This produces the gold-standard output that the test suite expects.
#

set -e

echo "=== Oracle Solution: Using black as the formatter ==="

pip install black --quiet 2>/dev/null

cat > /app/formatter/main.py << 'PYTHON'
#!/usr/bin/env python3
"""Oracle formatter implementation using Black."""

import sys
import black


def format_code(source: str, filepath: str = "") -> str:
    mode = black.Mode(
        target_versions={black.TargetVersion.PY312},
        line_length=88,
        string_normalization=True,
        magic_trailing_comma=True,
        preview=False,
    )
    try:
        return black.format_str(source, mode=mode)
    except black.NothingChanged:
        return source
    except Exception:
        return source


def main():
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <input_file> <output_file>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    with open(input_path, "r", encoding="utf-8") as f:
        source = f.read()

    formatted = format_code(source, input_path)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(formatted)


if __name__ == "__main__":
    main()
PYTHON

echo "=== Oracle solution installed ==="
echo "Verifying with a quick test..."

FIRST_CASE=$(ls -d /app/formatter/tests/cases/case_*/ 2>/dev/null | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    if [ -f "$FIRST_CASE/input.py" ]; then
        python3 /app/formatter/main.py "$FIRST_CASE/input.py" /tmp/oracle_test_output.py
        if diff -q /tmp/oracle_test_output.py "$FIRST_CASE/expected_output.py" >/dev/null 2>&1; then
            echo "Sanity check PASSED ($CASE_NAME)"
        else
            echo "WARNING: Sanity check output differs ($CASE_NAME)"
        fi
        rm -f /tmp/oracle_test_output.py
    fi
fi

echo "=== Oracle solution complete ==="
