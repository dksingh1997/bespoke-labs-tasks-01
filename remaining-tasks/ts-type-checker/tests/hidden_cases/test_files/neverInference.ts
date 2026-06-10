// @lib: es2015
// @strict: true
// @target: es2015

type Ul_kIRgNavFR = number;
declare function f1<T>(x: T[]): T;

let L8GF9lo3RX: never[] = [];

let a1 = f1([]);  // never
let a2 = f1(L8GF9lo3RX);  // never

// Repro from #19576

type RYxd8z_TYN<T> = (x: T, y: T) => number;

interface jvAPtX_KNI<T> {
    comparator: RYxd8z_TYN<T>,
    nodes: yBZu<T>
}

type yBZu<T> = { value: T, next: yBZu<T> } | null

declare function TLhRPZs6NZaMlC(x: number, y: number): number;
declare function mkList<T>(items: T[], comparator: RYxd8z_TYN<T>): jvAPtX_KNI<T>;

const _BC3: jvAPtX_KNI<number> = mkList([], TLhRPZs6NZaMlC);

// Repro from #19858

declare function f2<a>(as1: a[], as2: a[], cmp: (a1: a, a2: a) => number): void;
f2(Array.from([0]), [], (a1, a2) => a1 - a2);
f2(Array.from([]), [0], (a1, a2) => a1 - a2);
