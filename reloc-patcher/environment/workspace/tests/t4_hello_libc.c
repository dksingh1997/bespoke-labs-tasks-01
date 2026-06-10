/* T4: musl hello world -- requires CRT + libc.a linking.
   Adapted from mold hello-static.sh */
#include <stdio.h>

int main(void) {
    printf("Hello world\n");
    return 0;
}
