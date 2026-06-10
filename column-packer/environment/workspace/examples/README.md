The `basic/` directory and `expected/` outputs are generated during Docker
build. Each `expected/*.txt` is GNU `ls` output for the `basic` fixture with
some in-scope flags. Validate your implementation by diffing against them, e.g.:

    diff <(/app/workspace/rls <flags> /app/workspace/examples/basic) \
         /app/workspace/examples/expected/<case>.txt

(The exact filenames present depend on this task's scope; list `expected/`.)
