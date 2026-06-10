/* T3: Archive test -- calls add() from archive, uses .rodata for message.
   Linked with: start.o syscalls.o t3_multi_b.o t3_archive.a */

void my_write(int fd, const void *buf, unsigned long len);
void my_exit(int code);

int add(int a, int b);

static void write_int(int n) {
    char buf[12];
    int pos = 11;
    buf[pos--] = '\n';
    if (n == 0) {
        buf[pos--] = '0';
    } else {
        while (n > 0) {
            buf[pos--] = '0' + (n % 10);
            n /= 10;
        }
    }
    pos++;
    my_write(1, buf + pos, 12 - pos);
}

int main(void) {
    int result = add(17, 25);
    write_int(result);
    return (result == 42) ? 0 : 1;
}
