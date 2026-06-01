#!/bin/bash
#
# Oracle solution: Use google-java-format as the formatter backend.
# This produces the gold-standard output that the test suite expects.
#

set -e

echo "=== Oracle Solution: Using google-java-format as the formatter ==="

cat > /app/formatter/src/main/java/formatter/Main.java << 'JAVA'
package formatter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {

    public static String formatCode(String source, String filepath) {
        try {
            // Write source to temp file
            Path tempInput = Files.createTempFile("gjf_input_", ".java");
            Files.writeString(tempInput, source);

            // Run google-java-format
            ProcessBuilder pb = new ProcessBuilder(
                "java", "-jar", "/usr/local/lib/google-java-format.jar",
                "--aosp", tempInput.toString()
            );
            pb.redirectErrorStream(false);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();

            Files.deleteIfExists(tempInput);

            if (exitCode == 0) {
                return output;
            }
            return source;
        } catch (Exception e) {
            return source;
        }
    }

    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            System.err.println("Usage: java formatter.Main <input_file> <output_file>");
            System.exit(1);
        }

        String source = Files.readString(Path.of(args[0]));
        String formatted = formatCode(source, args[0]);
        Files.writeString(Path.of(args[1]), formatted);
    }
}
JAVA

# Build
cd /app/formatter
gradle -q build 2>/dev/null || {
    mkdir -p build/classes
    javac -d build/classes src/main/java/formatter/Main.java
}
cd - > /dev/null

echo "=== Oracle solution installed ==="
echo "Verifying with a quick test..."

FIRST_CASE=$(ls -d /app/formatter/tests/cases/case_*/ 2>/dev/null | head -1)
if [ -n "$FIRST_CASE" ]; then
    CASE_NAME=$(basename "$FIRST_CASE")
    if [ -f "$FIRST_CASE/input.java" ]; then
        java -cp /app/formatter/build/classes formatter.Main "$FIRST_CASE/input.java" /tmp/oracle_test_output.java 2>/dev/null
        if diff -q /tmp/oracle_test_output.java "$FIRST_CASE/expected_output.java" >/dev/null 2>&1; then
            echo "Sanity check PASSED ($CASE_NAME)"
        else
            echo "WARNING: Sanity check output differs ($CASE_NAME)"
        fi
        rm -f /tmp/oracle_test_output.java
    fi
fi

echo "=== Oracle solution complete ==="
