/* T5: Multi-source musl -- main calls functions from t5_multi_math.c.
   Tests cross-file linking with musl libc. */
#include <stdio.h>

int factorial(int n);
int fibonacci(int n);

int main(void) {
    printf("fact(10) = %d\n", factorial(10));
    printf("fib(15) = %d\n", fibonacci(15));

    int ok = (factorial(10) == 3628800) && (fibonacci(15) == 610);
    printf("result: %s\n", ok ? "PASS" : "FAIL");
    return ok ? 0 : 1;
}
