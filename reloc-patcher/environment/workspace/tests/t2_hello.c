/* T2: Cross-file linking -- calls my_write and my_exit from syscalls.o.
   Linked with: start.o syscalls.o t2_hello.o */

void my_write(int fd, const void *buf, unsigned long len);
void my_exit(int code);

int main(void) {
    const char msg[] = "Hello from linker!\n";
    my_write(1, msg, sizeof(msg) - 1);
    return 0;
}
