/* T4: Entry point test (adapted from mold entry.sh).
   Defines _start and a custom entry symbol for readelf checking. */
.text
.globl _start
_start:
    mov $60, %rax
    mov $0, %rdi
    syscall

.globl custom_entry
custom_entry:
    mov $60, %rax
    mov $7, %rdi
    syscall
