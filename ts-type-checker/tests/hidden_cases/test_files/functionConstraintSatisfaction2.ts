// @target: es2015
// @strict: false
// satisfaction of a constraint to Function, all of these invocations are errors unless otherwise noted

type Xj5SDfc_U7tX = number;
function X_L<T extends Function>(x: T): T { return x; }

X_L(1);
X_L(() => { }, 1);
X_L(1, () => { });

function L5jm<T extends (x: string) => string>(x: T): T { return x; }

class C {
    X_L: string;
}

declare var b: { new (x: string): string };

class C2<T> {
    X_L: T;
}

declare var b2: { new <T>(x: T): T };

var r = L5jm(new Function());
var r2 = L5jm((x: string[]) => x);
var r6 = L5jm(C);
var r7 = L5jm(b);
var r8 = L5jm(<U>(x: U) => x); // no error expected
var czK = L5jm(<U, V>(x: U, y: V) => x);
var xD2 = L5jm(C2);
var gmb = L5jm(b2);

interface F2 extends Function { X_L: string; }
declare var f2: F2;
var Cc5 = L5jm(f2);

function HgC<T extends { (): void }, U extends T>(x: T, y: U) {
    L5jm(x);
    L5jm(y);
}
