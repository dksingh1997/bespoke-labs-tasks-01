#!/bin/bash
#
# Oracle solution: Use rustfmt as the formatter backend.
# This produces the gold-standard output that the test suite expects.
#

set -e

echo "=== Oracle Solution: Using rustfmt as the formatter ==="

cat > /app/formatter/src/main.rs << 'RUST'
use std::env;
use std::fs;
use std::process;
use std::io::Write;
use std::process::{Command, Stdio};

fn format_code(source: &str, _filepath: &str) -> String {
    let mut child = Command::new("rustfmt")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .expect("Failed to spawn rustfmt");

    child.stdin.as_mut().unwrap().write_all(source.as_bytes()).unwrap();
    let output = child.wait_with_output().unwrap();

    if output.status.success() {
        String::from_utf8(output.stdout).unwrap_or_else(|_| source.to_string())
    } else {
        source.to_string()
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: {} <input_file> <output_file>", args[0]);
        process::exit(1);
    }

    let input_path = &args[1];
    let output_path = &args[2];

    let source = fs::read_to_string(input_path)
        .unwrap_or_else(|e| {
            eprintln!("Error reading input: {}", e);
            process::exit(1);
        });

    let formatted = format_code(&source, input_path);

    fs::write(output_path, formatted)
        .unwrap_or_else(|e| {
            eprintln!("Error writing output: {}", e);
            process::exit(1);
        });
}
RUST

echo "=== Oracle solution installed ==="
echo "Verifying with a quick test..."

FIRST_CASE=$(ls -d /app/formatter/tests/cases/case_*/ 2>/dev/null | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    if [ -f "$FIRST_CASE/input.rs" ]; then
        cargo run --manifest-path /app/formatter/Cargo.toml -- "$FIRST_CASE/input.rs" /tmp/oracle_test_output.rs 2>/dev/null
        if diff -q /tmp/oracle_test_output.rs "$FIRST_CASE/expected_output.rs" >/dev/null 2>&1; then
            echo "Sanity check PASSED ($CASE_NAME)"
        else
            echo "WARNING: Sanity check output differs ($CASE_NAME)"
        fi
        rm -f /tmp/oracle_test_output.rs
    fi
fi

echo "=== Oracle solution complete ==="
