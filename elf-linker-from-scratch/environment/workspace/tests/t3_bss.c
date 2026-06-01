/* T3: BSS section -- uninitialized globals must be zero.
   Linked with: start.o syscalls.o t3_bss.o */

void my_write(int fd, const void *buf, unsigned long len);
void my_exit(int code);

int bss_array[256];
int bss_single;
static char bss_buf[64];

int main(void) {
    int ok = 1;

    if (bss_single != 0) ok = 0;
    for (int i = 0; i < 256; i++) {
        if (bss_array[i] != 0) ok = 0;
    }
    for (int i = 0; i < 64; i++) {
        if (bss_buf[i] != 0) ok = 0;
    }

    if (ok) {
        const char msg[] = "bss ok\n";
        my_write(1, msg, sizeof(msg) - 1);
    } else {
        const char msg[] = "bss FAIL\n";
        my_write(1, msg, sizeof(msg) - 1);
        my_exit(1);
    }

    bss_array[0] = 42;
    bss_single = bss_array[0];
    return (bss_single == 42) ? 0 : 1;
}
