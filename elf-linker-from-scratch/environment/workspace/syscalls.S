.text

.globl my_write
my_write:
    mov %rdx, %rdx
    mov %rsi, %rsi
    mov %edi, %edi
    mov $1, %rax              /* SYS_write */
    syscall
    ret

.globl my_exit
my_exit:
    mov %edi, %edi
    mov $60, %rax             /* SYS_exit */
    syscall
