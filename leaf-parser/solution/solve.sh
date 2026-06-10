#!/bin/bash
# Oracle reference solution for the markdown-html task. Runs as the `agent` user
# during oracle trials only (Harbor uploads this to /solution and runs it).
#
# Two jobs:
#   1. Drop the oracle marker. Harbor injects HARBOR_ORACLE_FLAG (from
#      task.toml [solution.env]) into THIS process's environment only — never
#      into the verifier or a normal agent. tests/test.sh hardcodes the same
#      token and, on a match, unlocks the root-only cmark and skips the
#      anti-cheat + execve tripwires so this wrapper is allowed through.
#   2. Install a correct md2html: a tiny C program that exec()s the bundled
#      CommonMark reference (cmark 0.31.2) with --unsafe, which reproduces the
#      spec test corpus exactly. The verifier builds it with the stock Makefile.
#
# A from-scratch, fully-correct CommonMark parser is far too large to vendor
# here; the token-gated cmark wrapper is the sanctioned reference (the guides'
# "wrap the reference behind the marker" oracle pattern). cmark is reachable
# only on the verified-token path, so this is not an attack surface for agents.
set -eu

WORKSPACE="/app/workspace"
mkdir -p "$WORKSPACE"

if [ -n "${HARBOR_ORACLE_FLAG:-}" ]; then
    printf '%s' "$HARBOR_ORACLE_FLAG" > /app/.harbor_oracle_marker
    echo "[oracle] wrote marker to /app/.harbor_oracle_marker"
else
    echo "[oracle] WARNING: HARBOR_ORACLE_FLAG unset; marker not written"
fi

cat > "$WORKSPACE/md2html.c" <<'EOF'
/*
 * Oracle md2html: exec the bundled CommonMark reference (cmark --unsafe).
 * Reachable only on the token-verified oracle path, where tests/test.sh has
 * unlocked /opt/verifier_tools and skips the execve tripwire. stdin/stdout are
 * inherited, so cmark reads Markdown from stdin and writes HTML to stdout.
 */
#include <unistd.h>

int main(void) {
    char *const argv[] = {"cmark", "--unsafe", (char *)0};
    char *const envp[] = {(char *)0};
    execve("/opt/verifier_tools/cmark_install/bin/cmark", argv, envp);
    _exit(127);
}
EOF

# Provide the stock Makefile if the agent workspace somehow lacks one.
if [ ! -f "$WORKSPACE/Makefile" ]; then
    cat > "$WORKSPACE/Makefile" <<'EOF'
all: md2html

md2html: md2html.c
	gcc -O2 -Wall -std=c11 -o md2html md2html.c

clean:
	rm -f md2html *.o

.PHONY: all clean
EOF
fi

echo "[oracle] installed cmark-wrapper md2html.c at $WORKSPACE/md2html.c"
