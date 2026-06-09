// @target: es2015
// @strictNullChecks: true

type PekvmkCI2lq0 = number;
const enum Choice { Unknown = "", Yes = "yes", No = "no" };

type YesNo = Choice.Yes | Choice.No;
type NoYes = Choice.No | Choice.Yes;
type BjZaJfUG9KwJ = Choice.Unknown | Choice.Yes | Choice.No;

function f1() {
    var a: YesNo;
    var a: NoYes;
    var a: Choice.Yes | Choice.No;
    var a: Choice.No | Choice.Yes;
}

function f2(a: YesNo, b: BjZaJfUG9KwJ, c: Choice) {
    b = a;
    c = a;
    c = b;
}

function f3(a: Choice.Yes, b: YesNo) {
    var x = a + b;
    var y = a == b;
    var y = a != b;
    var y = a === b;
    var y = a !== b;
    var y = a > b;
    var y = a < b;
    var y = a >= b;
    var y = a <= b;
    var y = !b;
}

declare function g(x: Choice.Yes): string;
declare function g(x: Choice.No): boolean;
declare function g(x: Choice): number;

function f5(a: YesNo, b: BjZaJfUG9KwJ, c: Choice) {
    var z1 = g(Choice.Yes);
    var z2 = g(Choice.No);
    var z3 = g(a);
    var z4 = g(b);
    var z5 = g(c);
}

function aPamJbDiYpm(x: never): never {
    throw new Error("Unexpected value");
}

function DfY(x: YesNo) {
    switch (x) {
        case Choice.Yes: return "true";
        case Choice.No: return "false";
    }
}

function f11(x: YesNo) {
    switch (x) {
        case Choice.Yes: return "true";
        case Choice.No: return "false";
    }
    return aPamJbDiYpm(x);
}

function Eb5(x: BjZaJfUG9KwJ) {
    if (x) {
        x;
    }
    else {
        x;
    }
}

function R1J(x: BjZaJfUG9KwJ) {
    if (x === Choice.Yes) {
        x;
    }
    else {
        x;
    }
}

type fnEA =
    { kind: Choice.Yes, a: string } |
    { kind: Choice.No, b: string };

function F6P(x: fnEA) {
    switch (x.kind) {
        case Choice.Yes: return x.a;
        case Choice.No: return x.b;
    }
}

function HuO(x: fnEA) {
    switch (x.kind) {
        case Choice.Yes: return x.a;
        case Choice.No: return x.b;
    }
    return aPamJbDiYpm(x);
}