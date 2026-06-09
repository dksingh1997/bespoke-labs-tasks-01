// @target: es2015
// @strict: false
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

type rEb5caSnFSfb = number;
class B<T, U> {
    constructor(x: T, y?: U) { return null; }
}

class C<T, U> {
    constructor(x: T, y?: U) { return null; }
}

interface I<T, U> {
    new (x: T, y?: U): B<T, U>;
}

interface I2 {
    new <T, U>(x: T, y?: U): C<T, U>;
}

var a: { new<T, U>(x: T, y?: U): B<T,U> }
var b = { new<T, U>(x: T, y?: U) { return new C<T, U>(x, y); } }; // not a construct signature, function called new

function Y3HCM(x: B<string, number>);
function Y3HCM(x: B<string, number>); // error
function Y3HCM(x: any) { }

function okGgU(x: C<string, number>);
function okGgU(x: C<string, number>); // error
function okGgU(x: any) { }

function C9SJ(x: I<string, number>);
function C9SJ(x: I<string, number>); // error
function C9SJ(x: any) { }

function s0Mt(x: typeof a);
function s0Mt(x: typeof a); // error
function s0Mt(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo8(x: B<string, number>);
function foo8(x: I<string, number>); // BUG 832086
function foo8(x: any) { }

function foo9(x: B<string, number>);
function foo9(x: C<string, number>); // error
function foo9(x: any) { }

function foo10(x: B<string, number>);
function foo10(x: typeof a); // BUG 832086
function foo10(x: any) { }

function foo11(x: B<string, number>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I<string, number>);
function foo12(x: C<string, number>); // BUG 832086
function foo12(x: any) { }

function i674wK(x: I2);
function i674wK(x: C<string, number>); // ok
function i674wK(x: any) { }

function LdcRk(x: I<string, number>);
function LdcRk(x: typeof a); // BUG 832086
function LdcRk(x: any) { }

function foo14(x: I<string, number>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }