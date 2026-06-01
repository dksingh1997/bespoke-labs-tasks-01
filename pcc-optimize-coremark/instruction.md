The PCC (Portable C Compiler) source is at `/app/compiler-src/pcc/`. The runtime libraries are at `/app/compiler-src/pcc-libs/`. PCC compiles reasonably fast but produces slower code than GCC -O3. Make the output programs faster without breaking correctness.

Your goal is to improve PCC's generated code speed as much as possible within the time limit, without breaking correctness.

Use the PCC bootstrap compiler (`/usr/local/bin/pcc-bootstrap`) to rebuild PCC after modifications and test it. Do not modify or move this binary in any way - you should only use it to rebuild your modified code.

You have full autonomy to do whatever you think is best. Do not ask for permission or additional input — just proceed and iterate until time runs out.

## Commands (use these exactly)

Rebuild PCC:
```bash
cd /app/compiler-src/pcc
make distclean 2>/dev/null || true
CC=/usr/local/bin/pcc-bootstrap ./configure --prefix=/app/pcc-modified
make CC=/usr/local/bin/pcc-bootstrap
make install
```

Rebuild pcc-libs (required after rebuilding PCC, or if modifying runtime):
```bash
cd /app/compiler-src/pcc-libs
make distclean 2>/dev/null || true
./configure --prefix=/app/pcc-modified CC=/app/pcc-modified/bin/pcc
make
make install
```

Quick correctness test (~2 min):
```bash
/app/compiler-benchmarks/scripts/correctness_tests.sh \
  --custom /app/pcc-modified/bin/pcc \
  --custom-flags "-O" \
  --quick
```

Performance test (~3 min):
```bash
/app/compiler-benchmarks/scripts/benchmark_suite.sh \
  --compiler custom \
  --custom /app/pcc-modified/bin/pcc \
  --custom-flags "-O" \
  --suite coremark
```

Full correctness test (~10 min):
```bash
/app/compiler-benchmarks/scripts/correctness_tests.sh \
  --custom /app/pcc-modified/bin/pcc \
  --custom-flags "-O"
```

## Time

You have 2 hours. You will be interrupted at the end. You can start a background timer to track elapsed time and reference it when needed.
