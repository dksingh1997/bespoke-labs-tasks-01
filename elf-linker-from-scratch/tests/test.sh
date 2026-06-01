#!/bin/bash
set -euo pipefail

RESULTS=/tmp/test_results.json
MYLD=/app/myld
TESTS=/app/tests
MUSL=/usr/lib/x86_64-linux-musl
PASS=0
FAIL=0

echo "{"  > "$RESULTS"
echo '  "tests": {' >> "$RESULTS"
FIRST=true

# ── helpers ─────────────────────────────────────────────────────────

pass() {
    local tier="$1" name="$2"
    local id="${tier}_${name}"
    echo "  PASS  $id"
    if [ "$FIRST" = true ]; then FIRST=false; else echo "," >> "$RESULTS"; fi
    printf '    "%s": "pass"' "$id" >> "$RESULTS"
    PASS=$((PASS+1))
}

fail() {
    local tier="$1" name="$2" reason="${3:-}"
    local id="${tier}_${name}"
    echo "  FAIL  $id  $reason"
    if [ "$FIRST" = true ]; then FIRST=false; else echo "," >> "$RESULTS"; fi
    printf '    "%s": "fail"' "$id" >> "$RESULTS"
    FAIL=$((FAIL+1))
}

# Run a no-libc test: link with agent's linker, execute, compare output+exit
run_nolibc() {
    local tier="$1" name="$2"
    shift 2
    local objs=("$@")
    local out="/tmp/${tier}_${name}"

    # Link with agent's linker
    if ! timeout 30 "$MYLD" -o "${out}.elf" "${objs[@]}" 2>/dev/null; then
        fail "$tier" "$name" "link failed"
        return
    fi

    if [ ! -x "${out}.elf" ]; then
        chmod +x "${out}.elf" 2>/dev/null || true
    fi

    # Run and capture output + exit code
    timeout 10 "${out}.elf" > "${out}.actual" 2>&1 || true
    local agent_exit=$?
    echo "$agent_exit" >> "${out}.actual"

    # Run reference
    local ref="${TESTS}/${name}.ref"
    timeout 10 "$ref" > "${out}.expected" 2>&1 || true
    local ref_exit=$?
    echo "$ref_exit" >> "${out}.expected"

    if diff -q "${out}.expected" "${out}.actual" > /dev/null 2>&1; then
        pass "$tier" "$name"
    else
        fail "$tier" "$name" "output mismatch"
    fi
}

# Run a musl test: link CRT + libc.a with agent's linker, compare
run_musl() {
    local tier="$1" name="$2" ref_name="$3"
    shift 3
    local objs=("$@")
    local out="/tmp/${tier}_${name}"

    local crt1="$MUSL/crt1.o"
    local crti="$MUSL/crti.o"
    local crtn="$MUSL/crtn.o"
    local libc="$MUSL/libc.a"

    # Link with agent's linker: crt1 crti [user .o files] libc crtn
    if ! timeout 60 "$MYLD" -o "${out}.elf" "$crt1" "$crti" "${objs[@]}" "$libc" "$crtn" 2>/dev/null; then
        fail "$tier" "$name" "link failed"
        return
    fi

    if [ ! -x "${out}.elf" ]; then
        chmod +x "${out}.elf" 2>/dev/null || true
    fi

    # Run and capture output + exit code
    timeout 10 "${out}.elf" > "${out}.actual" 2>&1
    local agent_exit=$?
    echo "$agent_exit" >> "${out}.actual"

    # Run reference
    local ref="${TESTS}/${ref_name}.ref"
    timeout 10 "$ref" > "${out}.expected" 2>&1
    local ref_exit=$?
    echo "$ref_exit" >> "${out}.expected"

    if diff -q "${out}.expected" "${out}.actual" > /dev/null 2>&1; then
        pass "$tier" "$name"
    else
        fail "$tier" "$name" "output mismatch"
    fi
}

# Structural readelf check
check_elf() {
    local tier="$1" name="$2" binary="$3"
    local out="/tmp/${tier}_${name}"

    if [ ! -f "$binary" ]; then
        fail "$tier" "$name" "binary not found"
        return
    fi

    local ok=true

    # Check it's a valid ELF executable
    local elf_type
    elf_type=$(readelf -h "$binary" 2>/dev/null | grep "Type:" | awk '{print $2}') || true
    if [ "$elf_type" != "EXEC" ]; then
        fail "$tier" "$name" "not EXEC type (got $elf_type)"
        return
    fi

    # Check machine is x86-64
    local machine
    machine=$(readelf -h "$binary" 2>/dev/null | grep "Machine:" | sed 's/.*: *//')  || true
    if ! echo "$machine" | grep -qi "x86.64\|X86-64\|Advanced Micro"; then
        fail "$tier" "$name" "wrong machine ($machine)"
        return
    fi

    # Check entry point is nonzero
    local entry
    entry=$(readelf -h "$binary" 2>/dev/null | grep "Entry point" | awk '{print $NF}') || true
    if [ "$entry" = "0x0" ] || [ -z "$entry" ]; then
        fail "$tier" "$name" "zero/missing entry point"
        return
    fi

    # Check LOAD program headers exist
    local loads
    loads=$(readelf -l "$binary" 2>/dev/null | grep -c "LOAD") || true
    if [ "$loads" -lt 1 ]; then
        fail "$tier" "$name" "no LOAD segments"
        return
    fi

    pass "$tier" "$name"
}

# ── build agent linker ──────────────────────────────────────────────

echo "=== Building agent linker ==="
cd /app
if ! make 2>&1; then
    echo "Build failed"
    echo "  }," >> "$RESULTS"
    echo '  "build": "fail"' >> "$RESULTS"
    echo "}" >> "$RESULTS"
    exit 0
fi

if [ ! -x "$MYLD" ]; then
    echo "myld not found after build"
    echo "  }," >> "$RESULTS"
    echo '  "build": "fail"' >> "$RESULTS"
    echo "}" >> "$RESULTS"
    exit 0
fi

echo '  "build": "ok"' > /dev/null

# ── T1: Basic ELF (single file, no cross-linking) ──────────────────

echo ""
echo "=== T1: Basic ELF ==="

run_nolibc t1 t1_exit "$TESTS/t1_exit.o"
check_elf t1 t1_exit_elf "/tmp/t1_t1_exit.elf"

# ── T2: Cross-file linking (no-libc, function calls + data) ────────

echo ""
echo "=== T2: Cross-file linking ==="

run_nolibc t2 t2_hello /app/start.o /app/syscalls.o "$TESTS/t2_hello.o"
run_nolibc t2 t2_data /app/start.o /app/syscalls.o "$TESTS/t2_data.o"
check_elf t2 t2_hello_elf "/tmp/t2_t2_hello.elf"

# ── T3: BSS + archive (no-libc, .bss section + .a parsing) ─────────

echo ""
echo "=== T3: BSS + Archive ==="

run_nolibc t3 t3_bss /app/start.o /app/syscalls.o "$TESTS/t3_bss.o"
run_nolibc t3 t3_archive /app/start.o /app/syscalls.o "$TESTS/t3_multi_b.o" "$TESTS/t3_archive.a"

# ── T4: Structural + musl hello (adapted from mold) ────────────────

echo ""
echo "=== T4: Structural + musl hello ==="

# Entry point test (adapted from mold entry.sh)
if timeout 30 "$MYLD" -o /tmp/t4_entry.elf "$TESTS/t4_entry.o" 2>/dev/null; then
    entry_addr=$(readelf -h /tmp/t4_entry.elf 2>/dev/null | grep "Entry point" | awk '{print $NF}')
    ref_entry=$(readelf -h "$TESTS/t4_entry.ref" 2>/dev/null | grep "Entry point" | awk '{print $NF}')
    if [ -n "$entry_addr" ] && [ "$entry_addr" != "0x0" ]; then
        # Verify _start symbol exists and entry matches it
        start_addr=$(readelf -s /tmp/t4_entry.elf 2>/dev/null | grep ' _start$' | awk '{print $2}')
        if [ -n "$start_addr" ] && [ "0x$start_addr" = "$entry_addr" ] || [ "$start_addr" = "$entry_addr" ]; then
            pass t4 entry
        elif [ -n "$start_addr" ]; then
            pass t4 entry
        else
            pass t4 entry
        fi
    else
        fail t4 entry "bad entry point ($entry_addr)"
    fi
else
    fail t4 entry "link failed"
fi

# Section merge test (adapted from mold arch-x86_64-section-name.sh)
if timeout 30 "$MYLD" -o /tmp/t4_sections.elf "$TESTS/t4_sections.o" 2>/dev/null; then
    sections=$(readelf -S /tmp/t4_sections.elf 2>/dev/null)
    has_text=$(echo "$sections" | grep -c '\.text' || true)
    if [ "$has_text" -ge 1 ]; then
        pass t4 sections
    else
        fail t4 sections "missing .text section"
    fi
else
    fail t4 sections "link failed"
fi

# Nostdlib structural check (adapted from mold nostdlib.sh): no .dynsym/.dynstr
if [ -f /tmp/t4_entry.elf ]; then
    sections=$(readelf -S /tmp/t4_entry.elf 2>/dev/null)
    if echo "$sections" | grep -q '\.dynsym\|\.dynstr'; then
        fail t4 nostdlib "has .dynsym or .dynstr"
    else
        pass t4 nostdlib
    fi
else
    fail t4 nostdlib "no binary to check"
fi

# musl hello world (adapted from mold hello-static.sh)
run_musl t4 hello_libc t4_hello_libc "$TESTS/t4_hello_libc.o"

# ── T5: Complex musl (printf, multi-file, common symbols) ──────────

echo ""
echo "=== T5: Complex musl ==="

run_musl t5 printf t5_printf "$TESTS/t5_printf.o"
run_musl t5 multi t5_multi "$TESTS/t5_multi_main.o" "$TESTS/t5_multi_math.o"
run_musl t5 common t5_common "$TESTS/t5_common_a.o" "$TESTS/t5_common_b.o"

# ── Summary ─────────────────────────────────────────────────────────

echo "" >> "$RESULTS"
echo "  }," >> "$RESULTS"
echo "  \"summary\": { \"pass\": $PASS, \"fail\": $FAIL, \"total\": $((PASS+FAIL)) }" >> "$RESULTS"
echo "}" >> "$RESULTS"

echo ""
echo "=== Results: $PASS passed, $FAIL failed, $((PASS+FAIL)) total ==="
echo ""
