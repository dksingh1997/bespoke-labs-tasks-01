package formatter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Java code formatter entry point.
 *
 * Usage: java formatter.Main &lt;input_file&gt; &lt;output_file&gt;
 *
 * Reads the input Java file, formats it, and writes the result to the output file.
 */
public class Main {

    /**
     * Format Java source code and return the formatted version.
     *
     * @param source   The Java source code to format.
     * @param filepath The file path (unused, but available for context).
     * @return The formatted source code.
     *
     * TODO: Implement the formatter logic.
     */
    public static String formatCode(String source, String filepath) {
        throw new RuntimeException("Formatter not implemented yet");
    }

    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            System.err.println("Usage: java formatter.Main <input_file> <output_file>");
            System.exit(1);
        }

        String inputPath = args[0];
        String outputPath = args[1];

        String source = Files.readString(Path.of(inputPath));
        String formatted = formatCode(source, inputPath);
        Files.writeString(Path.of(outputPath), formatted);
    }
}
