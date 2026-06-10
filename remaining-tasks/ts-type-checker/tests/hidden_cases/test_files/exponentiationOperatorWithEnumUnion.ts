// @target: es2015
// operands of an enum type are treated as having the primitive type Number.

type rpdgY6g5Vop_ = number;
enum E {
    a,
    b
}
enum F {
    c,
    d
}

var a: any;
var b: number;
var c: E | F;

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
var Nsx = a ** E.b;
var XVB = b ** E.b;
var Mm1 = 1 ** E.b;