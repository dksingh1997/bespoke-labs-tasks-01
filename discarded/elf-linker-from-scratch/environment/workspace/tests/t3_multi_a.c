/* T3: Archive test -- provides add() and mul(), archived into t3_archive.a.
   Only pulled in if main references them. */

int add(int a, int b) {
    return a + b;
}

int mul(int a, int b) {
    return a * b;
}
