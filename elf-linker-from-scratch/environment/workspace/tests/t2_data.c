/* T2: Data sections -- .rodata string, .data global, cross-file calls.
   Linked with: start.o syscalls.o t2_data.o */

void my_write(int fd, const void *buf, unsigned long len);
void my_exit(int code);

static const char greeting[] = "data test ok\n";
static int counter = 99;

static unsigned long my_strlen(const char *s) {
    unsigned long n = 0;
    while (s[n]) n++;
    return n;
}

int main(void) {
    my_write(1, greeting, my_strlen(greeting));
    if (counter != 99) my_exit(1);
    counter = 0;
    return counter;
}
