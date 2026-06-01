#!/bin/bash
#
# Oracle solution: Use go/format as the formatter backend.
# This produces the gold-standard output that the test suite expects.
#

set -e

echo "=== Oracle Solution: Using go/format as the formatter ==="

cat > /app/formatter/main.go << 'GO'
package main

import (
	"fmt"
	"go/format"
	"os"
	"path/filepath"
)

func FormatCode(source string, fp string) string {
	formatted, err := format.Source([]byte(source))
	if err != nil {
		return source
	}
	return string(formatted)
}

func main() {
	if len(os.Args) != 3 {
		fmt.Fprintf(os.Stderr, "Usage: %s <input_file> <output_file>\n", os.Args[0])
		os.Exit(1)
	}

	inputPath := os.Args[1]
	outputPath := os.Args[2]

	source, err := os.ReadFile(inputPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading input: %v\n", err)
		os.Exit(1)
	}

	formatted := FormatCode(string(source), filepath.Base(inputPath))

	if err := os.WriteFile(outputPath, []byte(formatted), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Error writing output: %v\n", err)
		os.Exit(1)
	}
}
GO

echo "=== Oracle solution installed ==="
echo "Verifying with a quick test..."

FIRST_CASE=$(ls -d /app/formatter/tests/cases/case_*/ 2>/dev/null | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    if [ -f "$FIRST_CASE/input.go" ]; then
        go run /app/formatter/main.go "$FIRST_CASE/input.go" /tmp/oracle_test_output.go
        if diff -q /tmp/oracle_test_output.go "$FIRST_CASE/expected_output.go" >/dev/null 2>&1; then
            echo "Sanity check PASSED ($CASE_NAME)"
        else
            echo "WARNING: Sanity check output differs ($CASE_NAME)"
        fi
        rm -f /tmp/oracle_test_output.go
    fi
fi

echo "=== Oracle solution complete ==="
