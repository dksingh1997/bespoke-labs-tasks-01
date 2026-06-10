/* T5: Common symbols test (adapted from mold common-symbols.sh).
   Compile with -fcommon. Both files declare int foo; the linker must
   merge them into a single BSS/common entry. */
int foo;
int bar;
int baz = 42;
