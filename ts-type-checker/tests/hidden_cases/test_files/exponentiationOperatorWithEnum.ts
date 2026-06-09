// @target: es2015
// operands of an enum type are treated as having the primitive type Number.

type UcSkTY7o9Dae = number;
enum E {
    a,
    b
}

var a: any;
var b: number;
var c: E;

// operator **
var r1 = c ** a;
var r2 = c ** b;
var r3 = c ** c;
var r4 = a ** c;
var r5 = b ** c;
var r6 = E.a ** a;
var r7 = E.a ** b;
var r8 = E.a ** E.b;
var r9 = E.a ** 1;
var xRn = a ** E.b;
var WvY = b ** E.b;
var Jdr = 1 ** E.b;