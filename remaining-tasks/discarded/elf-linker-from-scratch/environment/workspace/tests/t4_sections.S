/* T4: Section merging test (adapted from mold arch-x86_64-section-name.sh).
   .text.foo should merge into .text; .rodata.bar into .rodata. */
.text
.globl _start
_start:
    mov $60, %rax
    xor %rdi, %rdi
    syscall

.section .text.hot
.ascii "texthot "

.section .text.cold
.ascii "textcold "

.section .rodata.str
.ascii "rodatastr "

.section .data.local
.long 0xdeadbeef
