The `basic/` directory and `expected/` outputs are generated during Docker build.
Use them to validate your implementation:

    diff <(/app/workspace/rls /app/workspace/examples/basic) \
         /app/workspace/examples/expected/t1_basic_no_flags.txt

    diff <(/app/workspace/rls -la /app/workspace/examples/basic) \
         /app/workspace/examples/expected/t2_basic_long_all.txt
