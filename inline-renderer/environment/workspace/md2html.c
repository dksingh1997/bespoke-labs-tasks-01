/*
 * md2html — CommonMark Markdown to HTML converter.
 *
 * Reads Markdown from stdin, writes HTML to stdout.
 *
 * Usage:
 *     echo "# Hello" | ./md2html
 *
 * TODO: Implement the full CommonMark specification.
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char *read_stdin(size_t *out_len) {
    size_t cap = 4096;
    size_t len = 0;
    char *buf = malloc(cap);
    if (!buf) return NULL;

    size_t n;
    while ((n = fread(buf + len, 1, cap - len, stdin)) > 0) {
        len += n;
        if (len == cap) {
            cap *= 2;
            char *tmp = realloc(buf, cap);
            if (!tmp) { free(buf); return NULL; }
            buf = tmp;
        }
    }
    *out_len = len;
    return buf;
}

/* TODO: Implement the CommonMark parser and HTML renderer. */
static char *convert(const char *input, size_t input_len) {
    (void)input;
    (void)input_len;
    char *out = malloc(1);
    if (out) out[0] = '\0';
    return out;
}

int main(void) {
    size_t input_len = 0;
    char *input = read_stdin(&input_len);
    if (!input) {
        fprintf(stderr, "md2html: failed to read stdin\n");
        return 1;
    }

    char *html = convert(input, input_len);
    if (html) {
        fputs(html, stdout);
        free(html);
    }

    free(input);
    return 0;
}
