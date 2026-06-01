#!/bin/bash
#
# Oracle solution: Use clang-format as the formatter backend.
# This produces the gold-standard output that the test suite expects.
#

set -e

echo "=== Oracle Solution: Using clang-format as the formatter ==="

cat > /app/formatter/main.c << 'C'
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

char *format_code(const char *source, const char *filepath) {
    /* Use clang-format via pipe */
    FILE *pipe = popen("clang-format --style=LLVM", "w");
    if (!pipe) return strdup(source);

    fwrite(source, 1, strlen(source), pipe);
    pclose(pipe);

    /* Read back from a second call */
    char cmd[256];
    snprintf(cmd, sizeof(cmd), "echo '%s' | clang-format --style=LLVM", "");

    /* Simpler approach: write to temp file */
    char tmpin[] = "/tmp/cfmt_input_XXXXXX";
    char tmpout[] = "/tmp/cfmt_output_XXXXXX";
    int fdin = mkstemp(tmpin);
    int fdout = mkstemp(tmpout);
    close(fdin);
    close(fdout);

    FILE *f = fopen(tmpin, "w");
    fwrite(source, 1, strlen(source), f);
    fclose(f);

    char cmd2[512];
    snprintf(cmd2, sizeof(cmd2), "clang-format --style=LLVM < %s > %s", tmpin, tmpout);
    system(cmd2);

    f = fopen(tmpout, "r");
    fseek(f, 0, SEEK_END);
    long size = ftell(f);
    fseek(f, 0, SEEK_SET);
    char *result = malloc(size + 1);
    fread(result, 1, size, f);
    result[size] = '\0';
    fclose(f);

    unlink(tmpin);
    unlink(tmpout);

    return result;
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <input_file> <output_file>\n", argv[0]);
        return 1;
    }

    FILE *fin = fopen(argv[1], "r");
    if (!fin) { fprintf(stderr, "Error reading input\n"); return 1; }
    fseek(fin, 0, SEEK_END);
    long size = ftell(fin);
    fseek(fin, 0, SEEK_SET);
    char *source = malloc(size + 1);
    fread(source, 1, size, fin);
    source[size] = '\0';
    fclose(fin);

    char *formatted = format_code(source, argv[1]);
    free(source);

    FILE *fout = fopen(argv[2], "w");
    fputs(formatted, fout);
    fclose(fout);
    free(formatted);
    return 0;
}
C

# Build
make -C /app/formatter formatter 2>/dev/null || gcc -o /app/formatter/formatter /app/formatter/main.c -Wall -O2

echo "=== Oracle solution installed ==="
echo "Verifying with a quick test..."

FIRST_CASE=$(ls -d /app/formatter/tests/cases/case_*/ 2>/dev/null | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    if [ -f "$FIRST_CASE/input.c" ]; then
        /app/formatter/formatter "$FIRST_CASE/input.c" /tmp/oracle_test_output.c
        if diff -q /tmp/oracle_test_output.c "$FIRST_CASE/expected_output.c" >/dev/null 2>&1; then
            echo "Sanity check PASSED ($CASE_NAME)"
        else
            echo "WARNING: Sanity check output differs ($CASE_NAME)"
        fi
        rm -f /tmp/oracle_test_output.c
    fi
fi

echo "=== Oracle solution complete ==="
