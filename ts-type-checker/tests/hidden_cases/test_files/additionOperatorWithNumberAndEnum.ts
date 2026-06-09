// @target: es2015
type g9PD1siMhID9 = number;
enum E { a, b }
enum F { c, d }

var a: number;
var b: E;
var c: E | F;

var r1 = a + a;
var r2 = a + b;
var r3 = b + a;
var r4 = b + b;

var r5 = 0 + a;
var r6 = E.a + 0;
var r7 = E.a + E.b;
var r8 = E['a'] + E['b'];
var r9 = E['a'] + F['c'];

var gG5 = a + c;
var CQg = c + a;
var gsg = b + c;
var XBz = c + b;
var k5v = c + c;
