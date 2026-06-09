#!/usr/bin/env python3
"""Analyze benchmark suite results."""

import sys
import csv
from collections import defaultdict

def load_results(path):
    """Load CSV results into structured data."""
    results = []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['status'] == 'OK':
                row['compile_sec'] = float(row['compile_sec'])
                row['size_bytes'] = int(row['size_bytes'])
                row['runtime_sec'] = float(row['runtime_sec'])
                results.append(row)
    return results

def print_summary(results):
    """Print summary tables."""
    
    # Group by compiler
    by_compiler = defaultdict(list)
    for r in results:
        key = f"{r['compiler']} {r['opt']}".strip()
        by_compiler[key].append(r)
    
    print("\n" + "="*70)
    print("COMPILER SUMMARY")
    print("="*70)
    print(f"{'Compiler':<15} {'Benchmarks':>10} {'Avg Runtime':>12} {'Avg Compile':>12} {'Avg Size':>12}")
    print("-"*70)
    
    for comp in ['gcc -O3', 'clang -O3', 'tcc', 'pcc -O', 'lacc -O3']:
        data = by_compiler.get(comp, [])
        if not data:
            continue
        n = len(data)
        avg_rt = sum(r['runtime_sec'] for r in data) / n
        avg_ct = sum(r['compile_sec'] for r in data) / n
        avg_sz = sum(r['size_bytes'] for r in data) / n
        print(f"{comp:<15} {n:>10} {avg_rt:>12.4f}s {avg_ct:>12.4f}s {avg_sz:>12,.0f}B")
    
    # Slowdown analysis (TCC vs GCC)
    print("\n" + "="*70)
    print("TCC SLOWDOWN vs GCC -O3 (higher = TCC slower)")
    print("="*70)
    
    gcc_rt = {(r['suite'], r['benchmark']): r['runtime_sec'] 
              for r in results if r['compiler'] == 'gcc' and r['opt'] == '-O3'}
    tcc_rt = {(r['suite'], r['benchmark']): r['runtime_sec'] 
              for r in results if r['compiler'] == 'tcc'}
    
    slowdowns = []
    for key in gcc_rt:
        if key in tcc_rt and gcc_rt[key] > 0.001:  # Skip very fast benchmarks
            slowdown = tcc_rt[key] / gcc_rt[key]
            slowdowns.append((key[0], key[1], slowdown, gcc_rt[key], tcc_rt[key]))
    
    slowdowns.sort(key=lambda x: -x[2])
    
    print(f"{'Suite':<12} {'Benchmark':<15} {'Slowdown':>10} {'GCC -O3':>12} {'TCC':>12}")
    print("-"*70)
    
    for suite, bench, slow, gcc, tcc in slowdowns[:20]:
        print(f"{suite:<12} {bench:<15} {slow:>10.2f}x {gcc:>12.4f}s {tcc:>12.4f}s")
    
    if len(slowdowns) > 20:
        print(f"... and {len(slowdowns) - 20} more")
    
    avg_slowdown = sum(s[2] for s in slowdowns) / len(slowdowns) if slowdowns else 0
    print(f"\nAverage TCC slowdown: {avg_slowdown:.2f}x")
    
    # Binary size comparison
    print("\n" + "="*70)
    print("BINARY SIZE COMPARISON")
    print("="*70)
    
    gcc_sz = {(r['suite'], r['benchmark']): r['size_bytes'] 
              for r in results if r['compiler'] == 'gcc' and r['opt'] == '-O3'}
    tcc_sz = {(r['suite'], r['benchmark']): r['size_bytes'] 
              for r in results if r['compiler'] == 'tcc'}
    
    size_ratios = []
    for key in gcc_sz:
        if key in tcc_sz and gcc_sz[key] > 0:
            ratio = tcc_sz[key] / gcc_sz[key]
            size_ratios.append((key[0], key[1], ratio, gcc_sz[key], tcc_sz[key]))
    
    size_ratios.sort(key=lambda x: -x[2])
    
    print(f"{'Suite':<12} {'Benchmark':<15} {'TCC/GCC':>10} {'GCC Size':>12} {'TCC Size':>12}")
    print("-"*70)
    
    for suite, bench, ratio, gcc, tcc in size_ratios[:10]:
        print(f"{suite:<12} {bench:<15} {ratio:>10.2f}x {gcc:>12,}B {tcc:>12,}B")
    
    avg_ratio = sum(s[2] for s in size_ratios) / len(size_ratios) if size_ratios else 0
    print(f"\nAverage TCC/GCC size ratio: {avg_ratio:.2f}x")
    
    # Verification results
    if 'correct' in results[0]:
        print("\n" + "="*70)
        print("VERIFICATION RESULTS")
        print("="*70)
        
        pass_count = sum(1 for r in results if r.get('correct') == 'PASS')
        fail_count = sum(1 for r in results if r.get('correct') == 'FAIL')
        na_count = sum(1 for r in results if r.get('correct') == 'N/A')
        
        print(f"PASS: {pass_count}")
        print(f"FAIL: {fail_count}")
        print(f"N/A:  {na_count}")
        
        if fail_count > 0:
            print("\nFailed verifications:")
            for r in results:
                if r.get('correct') == 'FAIL':
                    print(f"  {r['suite']}/{r['benchmark']}: {r['compiler']} {r['opt']}")

def main():
    if len(sys.argv) < 2:
        print("Usage: analyze_suite.py <results.csv>")
        sys.exit(1)
    
    results = load_results(sys.argv[1])
    if not results:
        print("No successful results found.")
        sys.exit(1)
    
    print(f"Loaded {len(results)} successful benchmark runs")
    print_summary(results)

if __name__ == '__main__':
    main()
