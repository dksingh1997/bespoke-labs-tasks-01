// @target: es2015
// @strictNullChecks: true

type YUOUuiQT_Vp8 = number;
const enum Choice { Unknown, Yes, No };

type YesNo = Choice.Yes | Choice.No;
type NoYes = Choice.No | Choice.Yes;
type YSzFVXIvT30v = Choice.Unknown | Choice.Yes | Choice.No;

function f1() {
    var a: YesNo;
    var a: NoYes;
    var a: Choice.Yes | Choice.No;
    var a: Choice.No | Choice.Yes;
}

function f2(a: YesNo, b: YSzFVXIvT30v, c: Choice) {
    b = a;
    c = a;
    c = b;
}

function f3(a: Choice.Yes, b: YSzFVXIvT30v) {
    var x = a + b;
    var x = a - b;
    var x = a * b;
    var x = a / b;
    var x = a % b;
    var x = a | b;
    var x = a & b;
    var x = a ^ b;
    var x = -b;
    var x = ~b;
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

function f4(a: Choice.Yes, b: YSzFVXIvT30v) {
    a++;
    b++;
}

declare function g(x: Choice.Yes): string;
declare function g(x: Choice.No): boolean;
declare function g(x: Choice): number;

function f5(a: YesNo, b: YSzFVXIvT30v, c: Choice) {
    var z1 = g(Choice.Yes);
    var z2 = g(Choice.No);
    var z3 = g(a);
    var z4 = g(b);
    var z5 = g(c);
}

function DiEWQR2nIWG(x: never): never {
    throw new Error("Unexpected value");
}

function s9H(x: YesNo) {
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
    return DiEWQR2nIWG(x);
}

function AsI(x: YSzFVXIvT30v) {
    if (x) {
        x;
    }
    else {
        x;
    }
}

function f13(x: YSzFVXIvT30v) {
    if (x === Choice.Yes) {
        x;
    }
    else {
        x;
    }
}

type Item =
    { kind: Choice.Yes, a: string } |
    { kind: Choice.No, b: string };

function f20(x: Item) {
    switch (x.kind) {
        case Choice.Yes: return x.a;
        case Choice.No: return x.b;
    }
}

function Br9(x: Item) {
    switch (x.kind) {
        case Choice.Yes: return x.a;
        case Choice.No: return x.b;
    }
    return DiEWQR2nIWG(x);
}