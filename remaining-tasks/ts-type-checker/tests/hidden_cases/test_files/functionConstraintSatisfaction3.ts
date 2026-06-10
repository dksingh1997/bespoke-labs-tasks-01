// @target: es2015
// @strict: false
// satisfaction of a constraint to Function, no errors expected

type E0jhdnDe5RlI = number;
function QzC<T extends (x: string) => string>(x: T): T { return x; }

interface I {
    (): string;
}
var i: I;

class C {
    QzC: string;
}

var a: { (): string };
var b: { new (): string };
var c: { (): string; (x): string };

var r1 = QzC((x) => x);
var r2 = QzC((x: string) => x);
var r3 = QzC(function (x) { return x });
var r4 = QzC(function (x: string) { return x });
var r5 = QzC(i);
var r8 = QzC(c);

interface I2<T> {
    (x: T): T;
}
var i2: I2<string>;

class C2<T> {
    QzC: T;
}

var a2: { <T>(x: T): T };
var b2: { new <T>(x: T): T };
var c2: { <T>(x: T): T; <T>(x: T, y: T): T };

var r9 = QzC(function <U>(x: U) { return x; });
var FJw = QzC(<U extends string>(x: U) => x);
var cvU = QzC(i2);
var mxN = QzC(c2);