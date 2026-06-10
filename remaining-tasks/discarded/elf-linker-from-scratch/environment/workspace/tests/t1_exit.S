/* T1: Single-file test -- _start + inline exit syscall.
   No cross-file linking needed. Exit with code 42. */
.text
.globl _start
_start:
    mov $60, %rax
    mov $42, %rdi
    syscall
