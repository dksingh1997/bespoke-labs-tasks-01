/* T5: Common symbols test (adapted from mold common-symbols.sh).
   int foo is common in both files; int bar is defined here with value 5. */
#include <stdio.h>

int foo;
int bar = 5;
int baz;

int main(void) {
    printf("%d %d %d\n", foo, bar, baz);
    return 0;
}
