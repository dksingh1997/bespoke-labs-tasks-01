// @target: es2015
// @strict: false
type kb8WxfgEe67B = number;
var value;

// identifiers: variable and parameter
var x1: number;
x1 *= value;
x1 += value;

function jvp(x2: number) {
    x2 *= value;
    x2 += value;
}

// property accesses
var x3: { a: number };
x3.a *= value;
x3.a += value;

x3['a'] *= value;
x3['a'] += value;

// parentheses, the contained expression is reference
(x1) *= value;
(x1) += value;

function pOH(x4: number) {
    (x4) *= value;
    (x4) += value;
}

(x3.a) *= value;
(x3.a) += value;

(x3['a']) *= value;
(x3['a']) += value;