#!/bin/bash
# Correctness-suite *producer*. This script never compares and never scores; it
# only runs a sed implementation over every test case and dumps the result to
# $OUTDIR/<id>.out (+ <id>.rc for stdout tests, +<id>.b for two-file tests).
#
# test.sh runs it three times:
#   1. ROOT, BEFORE the agent run, SEDBIN=/usr/bin/sed  -> golden outputs in a
#      root-only mktemp dir the agent can't read (the live /usr/bin/sed oracle).
#   2. AGENT (su agent, env -i) under the BUILD strace, DO_BUILD=1 BUILD_ONLY=1 ->
#      compiles mysed.c and stops immediately (no mysed runs). This keeps the
#      compiler toolchain's execs in their own strace log, away from the run
#      tripwire.
#   3. AGENT (su agent, env -i) under the RUN strace, SEDBIN=/app/mysed,
#      DO_BUILD=0 -> runs the already-built agent binary over the suite; outputs
#      go to an agent-writable dir. The agent never sees the golden dir, and
#      scoring (the GOLD-vs-actual compare) happens back in test.sh as root,
#      outside strace.
#
# No `set -euo pipefail`: a single failing case must not abort the whole suite.

SED="${SEDBIN:?SEDBIN required}"
OUT="${OUTDIR:?OUTDIR required}"
GNU="${GNUSTAGE:?GNUSTAGE required}"
WORK="${WORKDIR:?WORKDIR required}"

mkdir -p "$OUT" "$WORK"

# --- Build step (agent pass only) -------------------------------------------
# Compiles the agent's deliverable from source under the agent UID. On any
# failure we drop a marker and bail with no outputs, so the GOLD-vs-actual
# compare records every case as FAIL (reward ~0).
if [ "${DO_BUILD:-0}" = "1" ]; then
    cd /app || { : > "$OUT/.build_failed"; exit 0; }
    make clean >/dev/null 2>&1 || true
    if ! make >"$WORK/compile.log" 2>&1; then
        : > "$OUT/.build_failed"
        exit 0
    fi
    if [ ! -x /app/mysed ]; then
        : > "$OUT/.build_failed"
        exit 0
    fi
fi

# Build-only mode (verifier BUILD strace): stop here, BEFORE any mysed runs, so
# the compiler toolchain's execs (cc/gcc/as/ld/collect2/…) stay isolated in the
# build strace. The mysed execution happens in a separate RUN strace where the
# forbid-external-exec tripwire applies.
if [ "${BUILD_ONLY:-0}" = "1" ]; then
    exit 0
fi

# --- result writers ----------------------------------------------------------
save()  { printf '%s' "$2" > "$OUT/$1.out"; printf '%s' "$3" > "$OUT/$1.rc"; }
savef() { cp "$2" "$OUT/$1.out" 2>/dev/null || : > "$OUT/$1.out"; }
saveb() { cp "$2" "$OUT/$1.b"   2>/dev/null || : > "$OUT/$1.b"; }

# stdin-piped string -> normalized stdout + rc (mirrors old cmp_test)
cmp_in() {
    local id="$1" input="$2"; shift 2
    local out rc=0
    out=$(printf '%s\n' "$input" | LC_ALL=C timeout 10 "$SED" "$@" 2>/dev/null); rc=$?
    save "$id" "$out" "$rc"
}

# GNU suite: $SED $flags -f name.sed < name.inp -> \r-stripped stdout + rc
gnu() {
    local id="$1" name="$2" flags="$3"
    # NB: keep this default on its own line — referencing $name inside the same
    # `local` that assigns it expands the (still-empty) old value.
    local inp="${4:-$GNU/$name.inp}"
    local sf="$GNU/$name.sed" out rc=0
    out=$(LC_ALL=C timeout 30 "$SED" $flags -f "$sf" < "$inp" 2>/dev/null); rc=$?
    out=$(printf '%s' "$out" | LC_ALL=C tr -d '\r')
    save "$id" "$out" "$rc"
}

# ============================================================================
# T1 — Basic Commands
# ============================================================================
gnu t1_head    head    ""
gnu t1_dollar  dollar  ""
gnu t1_empty   empty   ""
gnu t1_allsub  allsub  ""
gnu t1_linecnt linecnt ""
gnu t1_enable  enable  ""
gnu t1_sep     sep     ""
gnu t1_inclib  inclib  ""
gnu t1_appquit appquit ""
gnu t1_insert  insert  ""

cmp_in t1_cli_sub    "hello foo world" 's/foo/bar/'
cmp_in t1_cli_global "foo bar foo"     's/foo/baz/g'
cmp_in t1_delete "aaa
bbb
ccc" '2d'
cmp_in t1_quit "line1
line2
line3" '2q'

# ============================================================================
# T2 — Addressing & Escaping
# ============================================================================
gnu t2_xabcx     xabcx     ""
gnu t2_xbxcx     xbxcx     ""
gnu t2_xbxcx3    xbxcx3    ""
gnu t2_noeol     noeol     ""
gnu t2_middle    middle    "-n"
gnu t2_bkslashes bkslashes ""
gnu t2_y-bracket y-bracket ""
gnu t2_brackets  brackets  ""
gnu t2_khadafy   khadafy   ""

cmp_in t2_n_grep "apple
banana
cherry" -n '/banana/p'
cmp_in t2_range_negate "aa
bb
cc
dd
ee" '2,4!s/./X/g'
cmp_in t2_dollar_addr "one
two
three" '$s/three/LAST/'

# ============================================================================
# T3 — Substitution Features
# ============================================================================
gnu t3_numsub  numsub  ""
gnu t3_numsub2 numsub2 "-n"
gnu t3_numsub3 numsub3 "-n"
gnu t3_numsub4 numsub4 "-n"
gnu t3_numsub5 numsub5 "-n"
gnu t3_insens  insens  "-n"
gnu t3_cv-vars cv-vars "-n"
gnu t3_distrib distrib "-n"

cmp_in t3_multi_e "hello world" -e 's/hello/HELLO/' -e 's/world/WORLD/'
cmp_in t3_braces "aaa
bbb
ccc" '/bbb/{s/b/B/g;s/B/X/}'

cat > "$WORK/script.sed" << 'SEDEOF'
s/apple/APPLE/
s/grape/GRAPE/
SEDEOF
cmp_in t3_script_file "apple banana grape" -f "$WORK/script.sed"

cmp_in t3_alt_delim    "path/to/file" 's,path/to,/new/path,'
cmp_in t3_re_plus      "abbbbc"       's/ab\+c/MATCH/'
cmp_in t3_re_question  "ac abc abbc"  's/ab\?c/X/g'
cmp_in t3_ampersand    "foo bar baz"  's/[a-z]\+/(&)/g'

# ============================================================================
# T4 — Hold Space & Multi-line
# ============================================================================
gnu t4_fasts     fasts     ""
gnu t4_y-newline y-newline ""
gnu t4_recall    recall    ""
gnu t4_recall2   recall2   ""
gnu t4_xemacs    xemacs    ""
gnu t4_classes   classes   "-n"

cmp_in t4_reverse "line1
line2
line3" '1!G;h;$!d'
cmp_in t4_join_pairs "aaa
bbb
ccc
ddd" 'N;s/\n/ /'
cmp_in t4_empty_recall "abc
def
abc" '/abc/s/a/X/;s//Y/'
cmp_in t4_d_restart "aaa
bbb
ccc" 'N;P;D'
cmp_in t4_n_eof "one
two
three" '$!N;s/\n/+/'
cmp_in t4_hold_accumulate "a
b
c
d" 'H;${x;s/\n/,/g;s/^,//;p};d'
cmp_in t4_append "first
second
third" '/second/a\APPENDED'
cmp_in t4_insert_cmd "first
second
third" '/second/i\INSERTED'
cmp_in t4_exchange "aaa
bbb
ccc" 'x;p;x'

# ============================================================================
# T5 — Complex Scripts & File I/O
# ============================================================================
gnu t5_uniq    uniq    ""
gnu t5_manis   manis   ""
gnu t5_madding madding ""
gnu t5_mac-mf  mac-mf  ""
gnu t5_8bit    8bit    ""
gnu t5_newjis  newjis  ""

# In-place editing (output IS the rewritten file)
echo "original content here" > "$WORK/ip.txt"
LC_ALL=C timeout 10 "$SED" -i 's/original/modified/' "$WORK/ip.txt" 2>/dev/null || true
savef t5_inplace "$WORK/ip.txt"

# In-place with .orig backup (two files)
echo "backup test data" > "$WORK/bak.txt"
LC_ALL=C timeout 10 "$SED" -i.orig 's/backup/changed/' "$WORK/bak.txt" 2>/dev/null || true
savef t5_inplace_bak "$WORK/bak.txt"
saveb t5_inplace_bak "$WORK/bak.txt.orig"

# Large file
seq 10000 > "$WORK/large.txt"
LC_ALL=C timeout 30 "$SED" 's/^5/FIVE/' "$WORK/large.txt" > "$OUT/t5_large.out" 2>/dev/null || true

# w command: write matching lines to a file
printf '%s\n' "alpha" "beta" "gamma" "delta" > "$WORK/w_inp.txt"
LC_ALL=C timeout 10 "$SED" -n "/a/w $WORK/w_out.txt" "$WORK/w_inp.txt" 2>/dev/null || true
savef t5_w_cmd "$WORK/w_out.txt"

# r command: read file and append after matched line
printf '%s\n' "INSERTED" > "$WORK/r_insert.txt"
cmp_in_r() {
    local id="$1" rc=0 out
    out=$(printf '%s\n' "before" "match" "after" | LC_ALL=C timeout 10 "$SED" "/match/r $WORK/r_insert.txt" 2>/dev/null); rc=$?
    save "$id" "$out" "$rc"
}
cmp_in_r t5_r_cmd

# In-place with multiple files
echo "file1data" > "$WORK/m1.txt"
echo "file2data" > "$WORK/m2.txt"
LC_ALL=C timeout 10 "$SED" -i 's/data/DATA/' "$WORK/m1.txt" "$WORK/m2.txt" 2>/dev/null || true
savef t5_inplace_multi "$WORK/m1.txt"
saveb t5_inplace_multi "$WORK/m2.txt"

cmp_in t5_q_with_n "line1
line2
line3" -n '2q'

# Multiple input files: line numbering doesn't reset
printf '%s\n' "A1" "A2" > "$WORK/fA.txt"
printf '%s\n' "B1" "B2" > "$WORK/fB.txt"
{ out=$(LC_ALL=C timeout 10 "$SED" '=' "$WORK/fA.txt" "$WORK/fB.txt" 2>/dev/null); rc=$?; }
save t5_multi_file_linenum "$out" "$rc"

# Mix of -e and -f
cat > "$WORK/mix.sed" << 'SEDEOF'
s/AAA/BBB/
SEDEOF
cmp_in t5_e_and_f "AAA CCC" -e 's/CCC/DDD/' -f "$WORK/mix.sed"

cmp_in t5_b_skip "hello" '/hello/{s/h/H/;b;s/e/E/}'

# ============================================================================
# T6 — Edge Cases & Programs
# ============================================================================
gnu t6_factor factor "-n"
gnu t6_dc     dc     "-n"

cmp_in t6_branch "baaad daaay" ':loop;s/aa/a/;t loop'
cmp_in t6_b_join "one
two
three" ':a;N;$!ba;s/\n/ /g'
cmp_in t6_empty_match_g  "abc"  's/b*/X/g'
cmp_in t6_empty_match_g2 "aabb" 's/a*/x/g'
cmp_in t6_empty_match_end   "" 's/$/X/'
cmp_in t6_empty_match_begin "" 's/^/X/'
cmp_in t6_class_alpha "abc 123 DEF"   's/[[:alpha:]]/X/g'
cmp_in t6_class_digit "abc 123 DEF"   's/[[:digit:]]/N/g'
cmp_in t6_class_space "hello  world"  's/[[:space:]]*/ /g'
cmp_in t6_class_upper "Hello World" -n '/[[:upper:]]/p'
cmp_in t6_backref_complex "aabbb"  's/\(a*\)\(b*\)/[\1][\2]/'
cmp_in t6_backref_nested  "abcabc" 's/\(.\)\(.\)\(.\)\1\2\3/MATCH/'
cmp_in t6_c_range "line1
line2
line3
line4
line5" '2,4c\REPLACED'
cmp_in t6_nested_braces "aa
bb
cc
dd
ee" '/bb/,/dd/{/cc/d}'
cmp_in t6_t_reset "aXb
cXd
eXf" 's/X/Y/;t done;s/$/!!/;:done'

# s///w flag: write to file on successful substitution
printf '%s\n' "yes_match" "no" "yes_also" > "$WORK/sw_inp.txt"
LC_ALL=C timeout 10 "$SED" -n "s/yes/YES/w $WORK/sw_out.txt" "$WORK/sw_inp.txt" 2>/dev/null || true
savef t6_s_write "$WORK/sw_out.txt"

cmp_in t6_y_alt_delim    "abc"   'y,abc,XYZ,'
cmp_in t6_bracket_literal "a]b[c" 's/[][]//g'
cmp_in t6_re_escaped     "a.b*c"  's/a\.b\*/MATCH/'
cmp_in t6_p_with_addr "aaa
bbb
ccc" -n '2s/b/B/p'
cmp_in t6_multi_label "xABCx" ':a;s/A//;ta;:b;s/B//;tb;:c;s/C//;tc'
cmp_in t6_newline_repl "hello world" 's/ /\
/'
cmp_in t6_regex_range "aa
start
bb
cc
stop
dd" '/start/,/stop/s/^/  /'
cmp_in t6_double_negate "A
B
C
D
E" '2,4{/C/!d}'
cmp_in t6_hold_across_d "keep
drop
also_keep" '/drop/{h;d};G'
cmp_in t6_interval_addr "ab
abb
abbb
abbbb" '/ab\{2,3\}/s/b/B/g'

# ============================================================================
# T7 — Stress Tests
# ============================================================================
gnu t7_binary  binary  "-n" "$GNU/binary.inp"
gnu t7_binary2 binary2 "-n" "$GNU/binary.inp"
gnu t7_binary3 binary3 "-n" "$GNU/binary.inp"

cmp_in t7_dnp_group "a1
a2
a3
b1
b2
b3
c1
c2
c3" 'N;N;P;s/.*\n//;P;D'
cmp_in t7_recall_exec "hello" -n 's/ell/ELL/p;/xxx/d;s//&!/p'
cmp_in t7_multiline_branch "START
data1
data2
END
other
START
data3
END" '/^START$/,/^END$/{H;/^END$/{x;s/\n/ /g;s/^ //;p}};d'
cmp_in t7_y_full "The Quick Brown Fox" 'y/abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ/'
cmp_in t7_tac_number "first
second
third
fourth
fifth" '=;{1!G;h;$!d}' -n
cmp_in t7_multi_cmd "test123data" 's/[0-9]//g;s/test/TEST/;s/data/DATA/'

# Stress: 50000-line file
seq 50000 > "$WORK/big.txt"
LC_ALL=C timeout 60 "$SED" '/^[0-9]*[13579]$/s/$/  odd/;/^[0-9]*[02468]$/s/$/ even/' "$WORK/big.txt" > "$OUT/t7_stress_50k.out" 2>/dev/null || true

cmp_in t7_range_negate "A
B
C
D
E" '/B/,/D/!d'
cmp_in t7_addr_recall "aXa
bXb
aXa
cXc" '/aXa/s/X/Y/;//{s/Y/Z/}'

long_line=$(head -c 10000 /dev/zero | LC_ALL=C tr '\0' 'A')
cmp_in t7_long_line "$long_line" 's/A\{100\}/X/g'

cmp_in t7_many_groups "123456789" 's/\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)/\9\8\7\6\5\4\3\2\1/'
cmp_in t7_interleave_aic "AAA
BBB
CCC" '1a\after1
2i\before2
3c\replaced3'
cmp_in t7_kv_extract "# comment
name=Alice
age=30
# another comment
city=NYC" '/^#/d;/=/!d;H;${x;s/^\n//;p};d' -n
cmp_in t7_rot13 "Hello World 123" 'y/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM/'
cmp_in t7_para_join "line1
line2

line3
line4
line5

line6" '/^$/!{H;d};x;s/\n/ /g;s/^ //'
cmp_in t7_strip_tags "plain <b>bold</b> text <i>italic</i> end" ':a;s/<[^>]*>//g;ta'
cmp_in t7_field_extract "aaa,bbb,ccc
111,222,333
x,y,z" 's/[^,]*,//;s/,.*//'

# In-place editing with complex script
printf '%s\n' "A" "B" "C" "B" "D" > "$WORK/ip_complex.txt"
LC_ALL=C timeout 10 "$SED" -i '/B/!{H;d};x;s/\n/ /g;s/^ //' "$WORK/ip_complex.txt" 2>/dev/null || true
savef t7_inplace_complex "$WORK/ip_complex.txt"

cmp_in t7_slide_window "1
2
3
4
5
6" 'N;N;s/\n/+/g;P;s/[^+]*+//;D'
cmp_in t7_range_hold_branch "BEGIN
alpha
beta
END
noise
BEGIN
gamma
END" '/^BEGIN$/,/^END$/{/^BEGIN$/!{/^END$/!H};/^END$/{x;s/^\n//;s/\n/,/g;p;s/.*//;h}};d' -n
cmp_in t7_nested_range_c "1
2
3
4
5
6
7
8
9" '3,7{5c\FIVE
/[46]/d}'

# Complex w + s///p + branching (two files: stdout + w file)
printf '%s\n' "cat" "dog" "catfish" "bird" "catnap" > "$WORK/combo_inp.txt"
LC_ALL=C timeout 10 "$SED" -n "s/cat/CAT/pw $WORK/combo_w.txt" "$WORK/combo_inp.txt" > "$OUT/t7_combo_spw.out" 2>/dev/null || true
saveb t7_combo_spw "$WORK/combo_w.txt"

cmp_in t7_squeeze_blanks "text1


text2



text3

text4" '/./,/^$/!d'

exit 0
