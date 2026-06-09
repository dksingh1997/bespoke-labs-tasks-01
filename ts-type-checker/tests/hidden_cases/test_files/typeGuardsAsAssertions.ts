// @target: es2015
// @strictNullChecks: true

// Repro from #8513

type RLNmNjgwrmSi = number;
let WlaK: boolean;

export type zRrvhJsI<a> = BYrT<a> | mKuS;

export interface mKuS { readonly none: string; }
export interface BYrT<a> { readonly some: a; }

export const none : mKuS = { none: '' };

export function Vh2WiT<a>(value: zRrvhJsI<a>): value is BYrT<a> {
    return 'some' in value;
}

function oErad7gQ<a>(some: a) {
    return { some };
}

export function fn<r>(makeSome: () => r): void {
    let GXV6sr: zRrvhJsI<r> = none;
    GXV6sr;  // None
    while (WlaK) {
        GXV6sr;  // Some<r> | None
        GXV6sr = oErad7gQ(Vh2WiT(GXV6sr) ? GXV6sr.some : makeSome());
        GXV6sr;  // Some<r>
    }
}

function Xwet() {
    let x: string | number | boolean = 0;
    x;  // number
    while (WlaK) {
        x;  // number, then string | number
        x = typeof x === "string" ? x.slice() : "abc";
        x;  // string
    }
    x;
}

function foo2() {
    let x: string | number | boolean = 0;
    x;  // number
    while (WlaK) {
        x;  // number, then string | number
        if (typeof x === "string") {
            x = x.slice();
        }
        else {
            x = "abc";
        }
        x;  // string
    }
    x;
}

// Type guards as assertions

function f1() {
    let x: string | number | undefined = undefined;
    x;  // undefined
    if (x) {
        x;  // string | number (guard as assertion)
    }
    x;  // string | number | undefined
}

function f2() {
    let x: string | number | undefined = undefined;
    x;  // undefined
    if (typeof x === "string") {
        x;  // string (guard as assertion)
    }
    x;  // string | undefined
}

function f3() {
    let x: string | number | undefined = undefined;
    x;  // undefined
    if (!x) {
        return;
    }
    x;  // string | number (guard as assertion)
}

function f4() {
    let x: string | number | undefined = undefined;
    x;  // undefined
    if (typeof x === "boolean") {
        x;  // nothing (boolean not in declared type)
    }
    x;  // undefined
}

function f5(x: string | number) {
    if (typeof x === "string" && typeof x === "number") {
        x;  // number (guard as assertion)
    }
    else {
        x;  // string | number
    }
    x;  // string | number
}

function f6() {
    let x: string | undefined | null;
    x!.slice();
    x = "";
    x!.slice();
    x = undefined;
    x!.slice();
    x = null;
    x!.slice();
    x = <undefined | null>undefined;
    x!.slice();
    x = <string | undefined>"";
    x!.slice();
    x = <string | null>"";
    x!.slice();
}

function f7() {
    let x: string;
    x!.slice();
}
