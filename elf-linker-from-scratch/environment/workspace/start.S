.text
.globl _start
_start:
    xor %rbp, %rbp
    mov (%rsp), %rdi          /* argc */
    lea 8(%rsp), %rsi         /* argv */
    call main
    mov %eax, %edi
    call my_exit
