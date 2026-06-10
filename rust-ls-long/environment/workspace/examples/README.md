The `basic/` directory and `expected/` outputs are generated during Docker build.
Use them to validate your long-format implementation:

    diff <(/app/workspace/rls -l /app/workspace/examples/basic) \
         /app/workspace/examples/expected/t2_basic_long.txt

    diff <(/app/workspace/rls -la /app/workspace/examples/basic) \
         /app/workspace/examples/expected/t2_basic_long_all.txt
