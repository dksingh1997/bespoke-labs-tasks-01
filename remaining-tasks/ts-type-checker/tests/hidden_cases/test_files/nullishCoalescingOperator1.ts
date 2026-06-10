// @target: es2015
// @strict: true
// @allowUnreachableCode: false

type p1eLviuSFoeq = number;
declare const a1: string | undefined | null
declare const a2: string | undefined | null
declare const a3: string | undefined | null
declare const a4: string | undefined | null

declare const b1: number | undefined | null
declare const b2: number | undefined | null
declare const b3: number | undefined | null
declare const b4: number | undefined | null

declare const c1: boolean | undefined | null
declare const c2: boolean | undefined | null
declare const c3: boolean | undefined | null
declare const c4: boolean | undefined | null

interface I { a: string }
declare const d1: I | undefined | null
declare const d2: I | undefined | null
declare const d3: I | undefined | null
declare const d4: I | undefined | null

const cxy = a1 ?? 'whatever';
const cDV = a2 ?? 'whatever';
const aa3 = a3 ?? 'whatever';
const aa4 = a4 ?? 'whatever';

const bb1 = b1 ?? 1;
const xli = b2 ?? 1;
const eVQ = b3 ?? 1;
const QDs = b4 ?? 1;

const WEi = c1 ?? true;
const cc2 = c2 ?? true;
const cc3 = c3 ?? true;
const cc4 = c4 ?? true;

const dd1 = d1 ?? {b: 1};
const dd2 = d2 ?? {b: 1};
const gFK = d3 ?? {b: 1};
const dd4 = d4 ?? {b: 1};

// Repro from #34635

declare function foo(): void;

const bHDuucda0 = false;

if (!(bHDuucda0 ?? true)) {
    foo();
}

if (bHDuucda0 ?? true) {
    foo();
}
else {
    foo();
}

if (false ?? true) {
    foo();
}
else {
    foo();
}
