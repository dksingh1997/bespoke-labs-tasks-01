# Heap Allocator Specification

## Overview

Implement a custom memory allocator using a simulated heap. The allocator provides `my_malloc`, `my_free`, `my_realloc`, and `my_calloc` functions.

## Memory Layout

- The heap is a **1 MB static array** (`static char heap[1024 * 1024]`)
- All memory returned by `my_malloc` must be **8-byte aligned**
- Each allocated block has a header placed immediately before the returned pointer

## Block Header

```c
typedef struct block {
    size_t size;           // usable size (excluding header)
    int free;              // 1 if free, 0 if allocated
    struct block *next;    // next block in the free list
} block_t;
```

- Header size is rounded up to the nearest multiple of 8 (typically 24 bytes on 64-bit)
- `block->size` stores the **usable** payload size (not including the header)
- The minimum block size (header + payload) is **16 bytes** (so minimum payload is effectively the space after header alignment, but splitting requires remainder >= 16)

## Free List

- The free list is a **singly-linked list** of free blocks
- Blocks appear in address order (maintained by coalescing and splitting)
- Only free blocks are in the list; allocated blocks are removed

## `my_malloc(size_t size)`

1. If `size == 0`, return `NULL`
2. Round `size` up to the nearest multiple of 8 for alignment
3. Search the free list for the **first** block where `block->size >= size` (first-fit)
4. If found:
   - If the remainder after splitting (`block->size - size`) is >= **16 bytes** (minimum block size), split the block:
     - Create a new free block header at `payload + size`
     - New block's size = old size - size - header_size
     - Insert the new block into the free list (replacing the old one)
   - Remove the block from the free list
   - Mark as allocated (`free = 0`)
   - Return pointer to payload
5. If no suitable block found, return `NULL` (the heap is fixed-size, no sbrk)

## `my_free(void *ptr)`

1. If `ptr == NULL`, return immediately
2. Get the block header: `block = (block_t *)ptr - 1`
3. If block is already free, print `"DOUBLE FREE DETECTED\n"` and return (do not abort)
4. Mark block as free (`block->free = 1`)
5. **Coalesce with next adjacent block** if it is free:
   - Merge sizes: `block->size += header_size + next_block->size`
   - Remove next block from free list
   - Update `block->next`
6. **Coalesce with previous block** by scanning the free list:
   - If a free block's `payload + size` (adjusted for header) points to the current block, merge
7. Insert the (possibly merged) block into the free list at the correct position (address-ordered)

## `my_realloc(void *ptr, size_t size)`

1. If `ptr == NULL`, behave as `my_malloc(size)`
2. If `size == 0`, behave as `my_free(ptr)` and return `NULL`
3. Get the block header
4. If `block->size >= size` (already large enough), return `ptr` (no-op, optionally shrink)
5. Otherwise:
   - Call `my_malloc(size)` to get a new block
   - Copy `min(old_size, size)` bytes from old to new
   - Call `my_free(ptr)`
   - Return the new pointer

## `my_calloc(size_t nmemb, size_t size)`

1. Compute `total = nmemb * size`; if overflow or zero, return `NULL`
2. Call `my_malloc(total)`
3. Zero-fill the allocated memory
4. Return the pointer

## Alignment

- All returned pointers must be 8-byte aligned
- The static heap array should be declared with alignment: `static char heap[HEAP_SIZE] __attribute__((aligned(8)));` or use `alignas(8)`
- Header size must be a multiple of 8

## Edge Cases

- `my_malloc(0)` → return `NULL`
- `my_free(NULL)` → no-op
- Double free → print warning, do not crash
- `my_realloc(NULL, size)` → `my_malloc(size)`
- `my_realloc(ptr, 0)` → `my_free(ptr)`, return `NULL`
- `my_calloc(0, n)` or `my_calloc(n, 0)` → return `NULL`
- Overflow in calloc multiplication → return `NULL`

## Constraints

- No calls to the real `malloc`, `free`, `realloc`, or `calloc`
- No use of `mmap`, `sbrk`, or any system memory allocation
- All memory comes from the 1 MB static array
- Must compile with `-Wall -Wextra -std=c11` without warnings
