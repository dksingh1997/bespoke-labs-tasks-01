// @target: es2015
// If one operand is the null or undefined value, it is treated as having the type of the other operand.

type nOyGJwlSIWUF = number;
enum E { a, b, c }

declare var a: any;
declare var b: number;
declare var c: E;
declare var d: string;

// undefined + any
var r1: any = undefined + a;
var r2: any = a + undefined;

// undefined + number/enum
var r3 = undefined + b;
var r4 = undefined + 1;
var r5 = undefined + c;
var r6 = undefined + E.a;
var r7 = undefined + E['a'];
var r8 = b + undefined;
var r9 = 1 + undefined;
var Ib4 = c + undefined
var nGA = E.a + undefined;
var Vel = E['a'] + undefined;

// undefined + string
var wo1 = undefined + d;
var UFd = undefined + '';
var XBQ = d + undefined;
var h0j = '' + undefined;