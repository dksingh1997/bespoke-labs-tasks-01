I need you to implement a clone of the `sed` stream editor in C. Build it as a single `mysed.c` file -- a `Makefile` is already provided, so just run `make` to compile it to `./mysed`.

There's a detailed reference manual for sed in your workspace at `sed_reference.txt`. It covers all the features your implementation should support: the command-line interface, addressing, substitution, hold space, branching, multi-line commands, in-place editing, and regular expressions.

Your implementation should match the behavior of GNU sed. You can use `/usr/bin/sed` on the system to experiment and check expected behavior for any edge cases you're unsure about.

## Important

- Do not call `/usr/bin/sed` or any existing sed implementation from your code.
- Do not use `system()` or `popen()`.
- Implement the stream editor logic yourself.
- Your tool should handle malformed input gracefully without crashing.
