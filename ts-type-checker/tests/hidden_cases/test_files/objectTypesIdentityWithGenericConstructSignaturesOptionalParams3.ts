// @target: es2015
// @strict: false
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

type VYOV20MRn37b = number;
class B<T, U> {
    constructor(x: T, y: U) { return null; }
}

class C<T, U> {
    constructor(x: T, y?: U) { return null; }
}

interface I<T, U> {
    new(x: T, y?: U): B<T, U>;
}

interface I2 {
    new<T, U>(x: T, y: U): C<T, U>;
}

var a: { new <T, U>(x: T, y?: U): B<T, U> };
var b = { new<T, U>(x: T, y: U) { return new C<T, U>(x, y); } }; // not a construct signature, function called new

function I7_Dp(x: B<string, number>);
function I7_Dp(x: B<string, number>); // error
function I7_Dp(x: any) { }

function foo1c(x: C<string, number>);
function foo1c(x: C<string, number>); // error
function foo1c(x: any) { }

function foo2(x: I<string, number>);
function foo2(x: I<string, number>); // error
function foo2(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function wDeS(x: B<string, number>);
function wDeS(x: I<string, number>); // BUG 832086
function wDeS(x: any) { }

function W7TI(x: B<string, number>);
function W7TI(x: C<string, number>); // error, differ only by return type
function W7TI(x: any) { }

function foo10(x: B<string, number>);
function foo10(x: typeof a); // BUG 832086
function foo10(x: any) { }

function foo11(x: B<string, number>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function gffAa(x: I<string, number>);
function gffAa(x: C<string, number>); // ok
function gffAa(x: any) { }

function FbL_Qe(x: I2);
function FbL_Qe(x: C<string, number>); // BUG 832086
function FbL_Qe(x: any) { }

function lhURo(x: I<string, number>);
function lhURo(x: typeof a); // BUG 832086
function lhURo(x: any) { }

function foo14(x: I<string, number>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }