# Heap Allocator

Implement a custom memory allocator in `myalloc.c` that provides `my_malloc`, `my_free`, `my_realloc`, and `my_calloc`.

Your allocator must follow the allocation strategy described in `spec.md` — a free-list approach with first-fit placement and block coalescing.

## Getting Started

1. Read `spec.md` for the full specification
2. Create `myalloc.c` in the workspace directory
3. Run `make` to build, which links your allocator with `test.c` to produce `test_runner`
4. Run `./test_runner` to see how your allocator performs

## Scoring

Score is based on passing all test assertions: `correct / total`.

The test harness runs 200+ deterministic operations covering:
- Basic malloc/free/realloc/calloc
- Block splitting and coalescing
- Edge cases (zero-size, double-free, NULL inputs)
- Fragmentation resistance
- Rapid allocation cycles

## Requirements

- Implement all four functions: `my_malloc`, `my_free`, `my_realloc`, `my_calloc`
- Follow the exact strategy in `spec.md` (first-fit, block splitting, bidirectional coalescing)
- 8-byte alignment on all returned pointers
- Pass all assertions in the test harness
