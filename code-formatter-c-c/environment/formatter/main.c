#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * Format C source code and return the formatted version.
 *
 * @param source The C source code to format.
 * @param filepath The file path (unused, but available for context).
 * @return The formatted source code (caller must free).
 *
 * TODO: Implement the formatter logic.
 */
char *format_code(const char *source, const char *filepath) {
    fprintf(stderr, "Formatter not implemented yet\n");
    exit(1);
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        fprintf(stderr, "Usage: %s <input_file> <output_file>\n", argv[0]);
        return 1;
    }

    const char *input_path = argv[1];
    const char *output_path = argv[2];

    /* Read input file */
    FILE *fin = fopen(input_path, "r");
    if (!fin) {
        fprintf(stderr, "Error reading input: %s\n", input_path);
        return 1;
    }

    fseek(fin, 0, SEEK_END);
    long size = ftell(fin);
    fseek(fin, 0, SEEK_SET);

    char *source = malloc(size + 1);
    if (!source) {
        fprintf(stderr, "Out of memory\n");
        fclose(fin);
        return 1;
    }
    fread(source, 1, size, fin);
    source[size] = '\0';
    fclose(fin);

    /* Format */
    char *formatted = format_code(source, input_path);
    free(source);

    /* Write output */
    FILE *fout = fopen(output_path, "w");
    if (!fout) {
        fprintf(stderr, "Error writing output: %s\n", output_path);
        free(formatted);
        return 1;
    }
    fputs(formatted, fout);
    fclose(fout);
    free(formatted);

    return 0;
}
