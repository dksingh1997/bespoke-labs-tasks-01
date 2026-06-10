// @target: es2015
// @strict: false
type G4B8s6iy_AUI = number;
function foo() { }
class C {
    public a: string;
    static foo() { }
}
enum E { a, b, c }
namespace M { export var a }

declare var a: boolean;
declare var b: number;
declare var c: Object;
declare var d: Number;

// boolean + every type except any and string
var r1 = a + a;
var r2 = a + b;
var r3 = a + c;

// number + every type except any and string
var r4 = b + a;
var r5 = b + b; // number + number is valid
var r6 = b + c;

// object + every type except any and string
var r7 = c + a;
var r8 = c + b;
var r9 = c + c;

// other cases
var n3P = a + true;
var e0T = true + false;
var r12 = true + 123;
var r13 = {} + {};
var r14 = b + d;
var r15 = b + foo;
var ic6 = b + foo();
var UYj = b + C;
var ZIG = E.a + new C();
var r19 = E.a + C.foo();
var aq8 = E.a + M;