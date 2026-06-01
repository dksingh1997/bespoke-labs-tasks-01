The Tiny C Compiler source is at `/app/compiler-src/tcc/`. It compiles fast but produces slow code. Make the output programs faster without breaking correctness.

Your goal is to improve the speed of code that TCC generates, specifically on the heapsort benchmark (from the LLVM SingleSource test suite). Your score is based entirely on how much faster the heapsort binary runs when compiled by your modified TCC versus the unmodified baseline TCC. Correctness must not regress — any new test failures gate the reward to zero.

Use the TCC bootstrap compiler (`/usr/local/bin/tcc-bootstrap`) to rebuild TCC after modifications and test it. Do not modify or move this binary in anyway - you should only use it to to rebuild your modified code.

You have full autonomy to do whatever you think is best. Do not ask for permission or additional input — just proceed and iterate until time runs out.

## Commands (use these exactly)

Rebuild TCC:
```bash
cd /app/compiler-src/tcc
make clean
CC=/usr/local/bin/tcc-bootstrap CFLAGS="-B/usr/local/tcc-bootstrap-full" ./configure
make CC=/usr/local/bin/tcc-bootstrap CFLAGS="-B/usr/local/tcc-bootstrap-full"
```

Quick correctness test (~2 min):
```bash
/app/compiler-benchmarks/scripts/correctness_tests.sh \
  --custom /app/compiler-src/tcc/tcc \
  --custom-flags "-B/app/compiler-src/tcc" \
  --quick
```

Performance test (~3 min):
```bash
/app/compiler-benchmarks/scripts/benchmark_suite.sh \
  --custom /app/compiler-src/tcc/tcc \
  --custom-flags "-B/app/compiler-src/tcc" \
  --suite llvm \
  --benchmark heapsort
```

Full correctness test (~10 min):
```bash
/app/compiler-benchmarks/scripts/correctness_tests.sh \
  --custom /app/compiler-src/tcc/tcc \
  --custom-flags "-B/app/compiler-src/tcc"
```

## Time

You have 2 hours. You will be interrupted at the end. You can start a background timer to track elapsed time and reference it when needed.
