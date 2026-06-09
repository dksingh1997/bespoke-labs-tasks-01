#!/bin/bash

MYSED=/app/mysed
GNU=/tests/gnu_suite
RESULTS=/logs/verifier/test_results.txt
LOGDIR=/logs/verifier
TMPDIR=$(mktemp -d)
mkdir -p "$LOGDIR"
> "$RESULTS"

pass() { echo "$1 PASS" >> "$RESULTS"; }
fail() { echo "$1 FAIL" >> "$RESULTS"; }

cd /app
make clean 2>/dev/null || true
if ! make 2>"$LOGDIR/compile.log"; then
    cp "$LOGDIR/compile.log" "$LOGDIR/test-stdout.txt"
    python3 /tests/compute_reward.py "$RESULTS"
    exit 0
fi

if [ ! -x "$MYSED" ]; then
    echo "FATAL: $MYSED not found after make" > "$LOGDIR/test-stdout.txt"
    python3 /tests/compute_reward.py "$RESULTS"
    exit 0
fi

# ----------------------------------------------------------------
# GNU test suite runner
# ----------------------------------------------------------------
run_gnu() {
    local tier="$1" name="$2" flags="$3" inp="$4" good="$5"
    local id="${tier}_${name}"
    local sed_file="$GNU/${name}.sed"
    local inp_file="${inp:-$GNU/${name}.inp}"
    local good_file="${good:-$GNU/${name}.good}"

    [ -f "$sed_file" ] || { fail "$id"; return; }
    [ -f "$inp_file" ] || { fail "$id"; return; }
    [ -f "$good_file" ] || { fail "$id"; return; }

    local actual rc=0
    actual=$(LC_ALL=C timeout 30 $MYSED $flags -f "$sed_file" < "$inp_file" 2>/dev/null) || rc=$?
    actual=$(printf '%s' "$actual" | LC_ALL=C tr -d '\r')
    local expected
    expected=$(LC_ALL=C tr -d '\r' < "$good_file") || true

    if [ "$actual" = "$expected" ] && [ "$rc" -eq 0 ]; then
        pass "$id"
    else
        fail "$id"
        {
            echo "=== $id (flags: $flags, exit=$rc) ==="
            echo "--- expected (first 20 lines) ---"
            echo "$expected" | head -20
            echo "--- actual (first 20 lines) ---"
            echo "$actual" | head -20
        } >> "$LOGDIR/failures.log"
    fi
}

# Helper: compare piped input through mysed vs /usr/bin/sed
cmp_test() {
    local id="$1" input="$2"
    shift 2
    local expected actual exp_rc=0 act_rc=0
    expected=$(printf '%s\n' "$input" | LC_ALL=C /usr/bin/sed "$@" 2>/dev/null) || exp_rc=$?
    actual=$(printf '%s\n' "$input" | LC_ALL=C timeout 10 $MYSED "$@" 2>/dev/null) || act_rc=$?
    if [ "$expected" = "$actual" ] && [ "$act_rc" -eq "$exp_rc" ]; then
        pass "$id"
    else
        fail "$id"
        {
            echo "=== $id ==="
            echo "ARGS: $*"
            echo "--- expected (exit=$exp_rc) ---"
            echo "$expected"
            echo "--- actual (exit=$act_rc) ---"
            echo "$actual"
        } >> "$LOGDIR/failures.log"
    fi
}

# Helper: compare file-producing commands
file_test() {
    local id="$1"
    shift
    local ref_file="$1" my_file="$2"
    if diff -q "$ref_file" "$my_file" >/dev/null 2>&1; then
        pass "$id"
    else
        fail "$id"
        {
            echo "=== $id ==="
            echo "--- expected (first 10 lines) ---"
            head -10 "$ref_file" 2>/dev/null
            echo "--- actual (first 10 lines) ---"
            head -10 "$my_file" 2>/dev/null
        } >> "$LOGDIR/failures.log"
    fi
}

# ================================================================
# T1 — Basic Commands (weight 0.03)
# ================================================================
run_gnu t1 head     ""
run_gnu t1 dollar   ""
run_gnu t1 empty    ""
run_gnu t1 allsub   ""
run_gnu t1 linecnt  ""
run_gnu t1 enable   ""
run_gnu t1 sep      ""
run_gnu t1 inclib   ""
run_gnu t1 appquit  ""
run_gnu t1 insert   ""

cmp_test t1_cli_sub "hello foo world" 's/foo/bar/'
cmp_test t1_cli_global "foo bar foo" 's/foo/baz/g'
cmp_test t1_delete "aaa
bbb
ccc" '2d'
cmp_test t1_quit "line1
line2
line3" '2q'

# ================================================================
# T2 — Addressing & Escaping (weight 0.05)
# ================================================================
run_gnu t2 xabcx    ""
run_gnu t2 xbxcx    ""
run_gnu t2 xbxcx3   ""
run_gnu t2 noeol    ""
run_gnu t2 middle   "-n"
run_gnu t2 bkslashes ""
run_gnu t2 y-bracket ""
run_gnu t2 brackets  ""
run_gnu t2 khadafy   ""

cmp_test t2_n_grep "apple
banana
cherry" -n '/banana/p'

# Address negation with range
cmp_test t2_range_negate "aa
bb
cc
dd
ee" '2,4!s/./X/g'

# Line number + $ address together
cmp_test t2_dollar_addr "one
two
three" '$s/three/LAST/'

# ================================================================
# T3 — Substitution Features (weight 0.07)
# ================================================================
run_gnu t3 numsub   ""
run_gnu t3 numsub2  "-n"
run_gnu t3 numsub3  "-n"
run_gnu t3 numsub4  "-n"
run_gnu t3 numsub5  "-n"
run_gnu t3 insens   "-n"
run_gnu t3 cv-vars  "-n"
run_gnu t3 distrib  "-n"

cmp_test t3_multi_e "hello world" -e 's/hello/HELLO/' -e 's/world/WORLD/'
cmp_test t3_braces "aaa
bbb
ccc" '/bbb/{s/b/B/g;s/B/X/}'

cat > "$TMPDIR/script.sed" << 'SEDEOF'
s/apple/APPLE/
s/grape/GRAPE/
SEDEOF
exp_rc=0; act_rc=0
expected=$(printf '%s\n' "apple banana grape" | /usr/bin/sed -f "$TMPDIR/script.sed" 2>/dev/null) || exp_rc=$?
actual=$(printf '%s\n' "apple banana grape" | timeout 10 $MYSED -f "$TMPDIR/script.sed" 2>/dev/null) || act_rc=$?
if [ "$expected" = "$actual" ] && [ "$act_rc" -eq "$exp_rc" ]; then pass t3_script_file; else fail t3_script_file; fi

# Alternative delimiter in s///
cmp_test t3_alt_delim "path/to/file" 's,path/to,/new/path,'

# \+ (one or more) and \? (zero or one) -- documented GNU extensions
cmp_test t3_re_plus "abbbbc" 's/ab\+c/MATCH/'
cmp_test t3_re_question "ac abc abbc" 's/ab\?c/X/g'

# & in replacement captures entire match
cmp_test t3_ampersand "foo bar baz" 's/[a-z]\+/(&)/g'

# ================================================================
# T4 — Hold Space & Multi-line (weight 0.10)
# ================================================================
run_gnu t4 fasts    ""
run_gnu t4 y-newline ""
run_gnu t4 recall   ""
run_gnu t4 recall2  ""
run_gnu t4 xemacs   ""
run_gnu t4 classes  "-n"

cmp_test t4_reverse "line1
line2
line3" '1!G;h;$!d'
cmp_test t4_join_pairs "aaa
bbb
ccc
ddd" 'N;s/\n/ /'

# Empty regex recall: // should recall the last *executed* regex
cmp_test t4_empty_recall "abc
def
abc" '/abc/s/a/X/;s//Y/'

# D command: delete first line of pattern space, restart script
cmp_test t4_d_restart "aaa
bbb
ccc" 'N;P;D'

# N at end-of-file: should print and exit by default
cmp_test t4_n_eof "one
two
three" '$!N;s/\n/+/'

# Complex hold space: accumulate then print
cmp_test t4_hold_accumulate "a
b
c
d" 'H;${x;s/\n/,/g;s/^,//;p};d'

# a\ command: append text after output
cmp_test t4_append "first
second
third" '/second/a\APPENDED'

# i\ command: insert text before output
cmp_test t4_insert_cmd "first
second
third" '/second/i\INSERTED'

# x (exchange) and h/g in combination
cmp_test t4_exchange "aaa
bbb
ccc" 'x;p;x'

# ================================================================
# T5 — Complex Scripts & File I/O (weight 0.15)
# ================================================================
run_gnu t5 uniq     ""
run_gnu t5 manis    ""
run_gnu t5 madding  ""
run_gnu t5 mac-mf   ""
run_gnu t5 8bit     ""
run_gnu t5 newjis   ""

# In-place editing
echo "original content here" > "$TMPDIR/ip.txt"
cp "$TMPDIR/ip.txt" "$TMPDIR/ip_ref.txt"
/usr/bin/sed -i 's/original/modified/' "$TMPDIR/ip_ref.txt" 2>/dev/null || true
timeout 10 $MYSED -i 's/original/modified/' "$TMPDIR/ip.txt" 2>/dev/null || true
file_test t5_inplace "$TMPDIR/ip_ref.txt" "$TMPDIR/ip.txt"

echo "backup test data" > "$TMPDIR/bak.txt"
cp "$TMPDIR/bak.txt" "$TMPDIR/bak_ref.txt"
/usr/bin/sed -i.orig 's/backup/changed/' "$TMPDIR/bak_ref.txt" 2>/dev/null || true
timeout 10 $MYSED -i.orig 's/backup/changed/' "$TMPDIR/bak.txt" 2>/dev/null || true
if diff -q "$TMPDIR/bak_ref.txt" "$TMPDIR/bak.txt" >/dev/null 2>&1 && \
   diff -q "$TMPDIR/bak_ref.txt.orig" "$TMPDIR/bak.txt.orig" >/dev/null 2>&1; then
    pass t5_inplace_bak
else
    fail t5_inplace_bak
fi

# Large file
seq 10000 > "$TMPDIR/large.txt"
/usr/bin/sed 's/^5/FIVE/' "$TMPDIR/large.txt" > "$TMPDIR/ref_lg.txt" 2>/dev/null || true
timeout 30 $MYSED 's/^5/FIVE/' "$TMPDIR/large.txt" > "$TMPDIR/my_lg.txt" 2>/dev/null || true
file_test t5_large "$TMPDIR/ref_lg.txt" "$TMPDIR/my_lg.txt"

# w command: write matching lines to file
printf '%s\n' "alpha" "beta" "gamma" "delta" > "$TMPDIR/w_inp.txt"
/usr/bin/sed -n '/a/w '"$TMPDIR"'/w_ref.txt' "$TMPDIR/w_inp.txt" 2>/dev/null || true
timeout 10 $MYSED -n '/a/w '"$TMPDIR"'/w_my.txt' "$TMPDIR/w_inp.txt" 2>/dev/null || true
file_test t5_w_cmd "$TMPDIR/w_ref.txt" "$TMPDIR/w_my.txt"

# r command: read file and append after matched line
printf '%s\n' "INSERTED" > "$TMPDIR/r_insert.txt"
r_exp=$(printf '%s\n' "before" "match" "after" | /usr/bin/sed '/match/r '"$TMPDIR"'/r_insert.txt' 2>/dev/null) || true
r_act=$(printf '%s\n' "before" "match" "after" | timeout 10 $MYSED '/match/r '"$TMPDIR"'/r_insert.txt' 2>/dev/null) || true
if [ "$r_exp" = "$r_act" ]; then pass t5_r_cmd; else fail t5_r_cmd; fi

# In-place with multiple files
echo "file1data" > "$TMPDIR/m1.txt"
echo "file2data" > "$TMPDIR/m2.txt"
cp "$TMPDIR/m1.txt" "$TMPDIR/m1_ref.txt"
cp "$TMPDIR/m2.txt" "$TMPDIR/m2_ref.txt"
/usr/bin/sed -i 's/data/DATA/' "$TMPDIR/m1_ref.txt" "$TMPDIR/m2_ref.txt" 2>/dev/null || true
timeout 10 $MYSED -i 's/data/DATA/' "$TMPDIR/m1.txt" "$TMPDIR/m2.txt" 2>/dev/null || true
if diff -q "$TMPDIR/m1_ref.txt" "$TMPDIR/m1.txt" >/dev/null 2>&1 && \
   diff -q "$TMPDIR/m2_ref.txt" "$TMPDIR/m2.txt" >/dev/null 2>&1; then
    pass t5_inplace_multi
else
    fail t5_inplace_multi
fi

# q with -n: should NOT print before quitting
cmp_test t5_q_with_n "line1
line2
line3" -n '2q'

# Multiple input files: line numbering doesn't reset
printf '%s\n' "A1" "A2" > "$TMPDIR/fA.txt"
printf '%s\n' "B1" "B2" > "$TMPDIR/fB.txt"
expected=$(/usr/bin/sed '=' "$TMPDIR/fA.txt" "$TMPDIR/fB.txt" 2>/dev/null) || true
actual=$(timeout 10 $MYSED '=' "$TMPDIR/fA.txt" "$TMPDIR/fB.txt" 2>/dev/null) || true
if [ "$expected" = "$actual" ]; then pass t5_multi_file_linenum; else fail t5_multi_file_linenum; fi

# Mix of -e and -f
cat > "$TMPDIR/mix.sed" << 'SEDEOF'
s/AAA/BBB/
SEDEOF
cmp_test t5_e_and_f "AAA CCC" -e 's/CCC/DDD/' -f "$TMPDIR/mix.sed"

# b without label: skip to end of script
cmp_test t5_b_skip "hello" '/hello/{s/h/H/;b;s/e/E/}'

# ================================================================
# T6 — Edge Cases & Programs (weight 0.25)
#   Tests subtle spec-compliance: empty matches, POSIX classes,
#   regex recall semantics, c\ with ranges, complex programs.
# ================================================================
run_gnu t6 factor   "-n"
run_gnu t6 dc       "-n"

cmp_test t6_branch "baaad daaay" ':loop;s/aa/a/;t loop'
cmp_test t6_b_join "one
two
three" ':a;N;$!ba;s/\n/ /g'

# Empty-match with g flag (same class of bug as xbxcx)
cmp_test t6_empty_match_g "abc" 's/b*/X/g'
cmp_test t6_empty_match_g2 "aabb" 's/a*/x/g'
cmp_test t6_empty_match_end "" 's/$/X/'
cmp_test t6_empty_match_begin "" 's/^/X/'

# POSIX character classes
cmp_test t6_class_alpha "abc 123 DEF" 's/[[:alpha:]]/X/g'
cmp_test t6_class_digit "abc 123 DEF" 's/[[:digit:]]/N/g'
cmp_test t6_class_space "hello  world" 's/[[:space:]]*/ /g'
cmp_test t6_class_upper "Hello World" -n '/[[:upper:]]/p'

# Backreference edge cases
cmp_test t6_backref_complex "aabbb" 's/\(a*\)\(b*\)/[\1][\2]/'
cmp_test t6_backref_nested "abcabc" 's/\(.\)\(.\)\(.\)\1\2\3/MATCH/'

# c\ command with range: text written once at end of range
cmp_test t6_c_range "line1
line2
line3
line4
line5" '2,4c\REPLACED'

# Nested braces with multiple addresses
cmp_test t6_nested_braces "aa
bb
cc
dd
ee" '/bb/,/dd/{/cc/d}'

# t resets after each line, not just after substitution
cmp_test t6_t_reset "aXb
cXd
eXf" 's/X/Y/;t done;s/$/!!/;:done'

# s///w flag: write to file on successful substitution
printf '%s\n' "yes_match" "no" "yes_also" > "$TMPDIR/sw_inp.txt"
/usr/bin/sed -n 's/yes/YES/w '"$TMPDIR"'/sw_ref.txt' "$TMPDIR/sw_inp.txt" 2>/dev/null || true
timeout 10 $MYSED -n 's/yes/YES/w '"$TMPDIR"'/sw_my.txt' "$TMPDIR/sw_inp.txt" 2>/dev/null || true
file_test t6_s_write "$TMPDIR/sw_ref.txt" "$TMPDIR/sw_my.txt"

# Alternative delimiter in y command
cmp_test t6_y_alt_delim "abc" 'y,abc,XYZ,'

# ] as first character in character class (literal)
cmp_test t6_bracket_literal "a]b[c" 's/[][]//g'

# Regex with escaped special chars
cmp_test t6_re_escaped "a.b*c" 's/a\.b\*/MATCH/'

# Combined p flag with address
cmp_test t6_p_with_addr "aaa
bbb
ccc" -n '2s/b/B/p'

# Multiple labels and branching
cmp_test t6_multi_label "xABCx" ':a;s/A//;ta;:b;s/B//;tb;:c;s/C//;tc'

# Substitution with newline in replacement
cmp_test t6_newline_repl "hello world" 's/ /\
/'

# Address range with regex on both ends
cmp_test t6_regex_range "aa
start
bb
cc
stop
dd" '/start/,/stop/s/^/  /'

# Double negation: line address + range + !
cmp_test t6_double_negate "A
B
C
D
E" '2,4{/C/!d}'

# Hold space preservation across d command
cmp_test t6_hold_across_d "keep
drop
also_keep" '/drop/{h;d};G'

# Interval expression \{N,M\} in address regex
cmp_test t6_interval_addr "ab
abb
abbb
abbbb" '/ab\{2,3\}/s/b/B/g'

# ================================================================
# T7 — Stress Tests (weight 0.35)
#   Binary calculators + hardest edge cases that require
#   a near-complete, correct implementation.
# ================================================================
run_gnu t7 binary   "-n" "$GNU/binary.inp" "$GNU/binary.good"
run_gnu t7 binary2  "-n" "$GNU/binary.inp" "$GNU/binary.good"
run_gnu t7 binary3  "-n" "$GNU/binary.inp" "$GNU/binary.good"

# Complex D/N/P loop: print first line of each 3-line group
cmp_test t7_dnp_group "a1
a2
a3
b1
b2
b3
c1
c2
c3" 'N;N;P;s/.*\n//;P;D'

# Regex recall across commands: last *executed* (not compiled) regex
cmp_test t7_recall_exec "hello" -n 's/ell/ELL/p;/xxx/d;s//&!/p'

# Complex multi-line accumulation with branching
cmp_test t7_multiline_branch "START
data1
data2
END
other
START
data3
END" '/^START$/,/^END$/{H;/^END$/{x;s/\n/ /g;s/^ //;p}};d'

# y command with full alphabet transliteration
cmp_test t7_y_full "The Quick Brown Fox" 'y/abcdefghijklmnopqrstuvwxyz/ABCDEFGHIJKLMNOPQRSTUVWXYZ/'

# Alternating hold/pattern with complex script
cmp_test t7_tac_number "first
second
third
fourth
fifth" '=;{1!G;h;$!d}' -n

# Multiple semicolons and commands on one line
cmp_test t7_multi_cmd "test123data" 's/[0-9]//g;s/test/TEST/;s/data/DATA/'

# Stress: 50000-line file with complex substitution
seq 50000 > "$TMPDIR/big.txt"
/usr/bin/sed '/^[0-9]*[13579]$/s/$/  odd/;/^[0-9]*[02468]$/s/$/ even/' "$TMPDIR/big.txt" > "$TMPDIR/big_ref.txt" 2>/dev/null || true
timeout 60 $MYSED '/^[0-9]*[13579]$/s/$/  odd/;/^[0-9]*[02468]$/s/$/ even/' "$TMPDIR/big.txt" > "$TMPDIR/big_my.txt" 2>/dev/null || true
file_test t7_stress_50k "$TMPDIR/big_ref.txt" "$TMPDIR/big_my.txt"

# Address range with regex, followed by negation
cmp_test t7_range_negate "A
B
C
D
E" '/B/,/D/!d'

# Empty pattern in address should recall last regex
cmp_test t7_addr_recall "aXa
bXb
aXa
cXc" '/aXa/s/X/Y/;//{s/Y/Z/}'

# Very long line: 10000 chars
long_line=$(python3 -c "print('A'*10000)")
cmp_test t7_long_line "$long_line" 's/A\{100\}/X/g'

# Regex with many backreference groups
cmp_test t7_many_groups "123456789" 's/\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)\(.\)/\9\8\7\6\5\4\3\2\1/'

# Interleaved a\ i\ c\ commands
cmp_test t7_interleave_aic "AAA
BBB
CCC" '1a\after1
2i\before2
3c\replaced3'

# Complex: extract key=value pairs via hold space
cmp_test t7_kv_extract "# comment
name=Alice
age=30
# another comment
city=NYC" '/^#/d;/=/!d;H;${x;s/^\n//;p};d' -n

# ROT13: full alphabet transliteration (a->n, b->o, etc.)
cmp_test t7_rot13 "Hello World 123" 'y/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM/'

# Paragraph joiner: join lines within blank-line-separated paragraphs
cmp_test t7_para_join "line1
line2

line3
line4
line5

line6" '/^$/!{H;d};x;s/\n/ /g;s/^ //'

# Strip HTML-like tags: loop removing <...> patterns
cmp_test t7_strip_tags "plain <b>bold</b> text <i>italic</i> end" ':a;s/<[^>]*>//g;ta'

# Field extraction: get 2nd comma-delimited field via loop
cmp_test t7_field_extract "aaa,bbb,ccc
111,222,333
x,y,z" 's/[^,]*,//;s/,.*//'

# In-place editing with complex script (hold space + branching)
printf '%s\n' "A" "B" "C" "B" "D" > "$TMPDIR/ip_complex.txt"
cp "$TMPDIR/ip_complex.txt" "$TMPDIR/ip_complex_ref.txt"
/usr/bin/sed -i '/B/!{H;d};x;s/\n/ /g;s/^ //' "$TMPDIR/ip_complex_ref.txt" 2>/dev/null || true
timeout 10 $MYSED -i '/B/!{H;d};x;s/\n/ /g;s/^ //' "$TMPDIR/ip_complex.txt" 2>/dev/null || true
file_test t7_inplace_complex "$TMPDIR/ip_complex_ref.txt" "$TMPDIR/ip_complex.txt"

# D/N/P with address range + substitution: sliding window transform
cmp_test t7_slide_window "1
2
3
4
5
6" 'N;N;s/\n/+/g;P;s/[^+]*+//;D'

# Multi-feature: address range + hold + branch + recall
cmp_test t7_range_hold_branch "BEGIN
alpha
beta
END
noise
BEGIN
gamma
END" '/^BEGIN$/,/^END$/{/^BEGIN$/!{/^END$/!H};/^END$/{x;s/^\n//;s/\n/,/g;p;s/.*//;h}};d' -n

# Nested ranges with c\ and negation
cmp_test t7_nested_range_c "1
2
3
4
5
6
7
8
9" '3,7{5c\FIVE
/[46]/d}'

# Complex w + s///p + branching in one script
printf '%s\n' "cat" "dog" "catfish" "bird" "catnap" > "$TMPDIR/combo_inp.txt"
/usr/bin/sed -n 's/cat/CAT/pw '"$TMPDIR"'/combo_ref.txt' "$TMPDIR/combo_inp.txt" > "$TMPDIR/combo_ref_out.txt" 2>/dev/null || true
timeout 10 $MYSED -n 's/cat/CAT/pw '"$TMPDIR"'/combo_my.txt' "$TMPDIR/combo_inp.txt" > "$TMPDIR/combo_my_out.txt" 2>/dev/null || true
if diff -q "$TMPDIR/combo_ref_out.txt" "$TMPDIR/combo_my_out.txt" >/dev/null 2>&1 && \
   diff -q "$TMPDIR/combo_ref.txt" "$TMPDIR/combo_my.txt" >/dev/null 2>&1; then
    pass t7_combo_spw
else
    fail t7_combo_spw
fi

# Squeeze multiple blank lines to single blank line (classic sed program)
cmp_test t7_squeeze_blanks "text1


text2



text3

text4" '/./,/^$/!d'

# ================================================================
# Done
# ================================================================
rm -rf "$TMPDIR"
python3 /tests/compute_reward.py "$RESULTS"
