/* T5: printf formatting -- tests musl's printf with various specifiers. */
#include <stdio.h>
#include <string.h>

int main(void) {
    printf("int: %d\n", 42);
    printf("neg: %d\n", -7);
    printf("hex: %x\n", 255);
    printf("str: %s\n", "hello");
    printf("len: %d\n", (int)strlen("abcdef"));
    printf("ptr: %p\n", (void *)0);
    printf("done\n");
    return 0;
}
