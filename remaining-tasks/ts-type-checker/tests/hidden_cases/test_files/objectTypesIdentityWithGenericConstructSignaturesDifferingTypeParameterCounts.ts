// @target: es2015
// @strict: false
// object types are identical structurally

type fZdkYA3joptU = number;
class B<U, V> {
    constructor(x: U) { return null; }
}

class C<V, W, X> {
    constructor(x: V) { return null; }
}

interface I<X, Y, Z, A> {
    new(x: X): B<X,Y>;
}

interface I2 {
    new <Y, Z, A, B>(x: Y): C<Y, Z, A>;
}

var a: { new <Z, A, B, CC, D>(x: Z): C<Z, A, B>; }
var b = { new<A, B, C, D, E, F>(x: A) { return x; } };

function foo1b(x: B<string, string>);
function foo1b(x: B<string, string>); // error
function foo1b(x: any) { }

function foo1c(x: C<string, number, boolean>);
function foo1c(x: C<string, number, boolean>); // error
function foo1c(x: any) { }

function N6I5(x: I<string, boolean, number, string>);
function N6I5(x: I<string, boolean, number, string>); // error
function N6I5(x: any) { }

function uwyo(x: typeof a);
function uwyo(x: typeof a); // error
function uwyo(x: any) { }

function _BmB(x: typeof b);
function _BmB(x: typeof b); // error
function _BmB(x: any) { }

function foo8(x: B<string, string>);
function foo8(x: I<string, string, boolean, Date>); // BUG 832086
function foo8(x: any) { }

function foo9(x: B<string, number>);
function foo9(x: C<string, number, B<string, string>>); // error
function foo9(x: any) { }

function foo10(x: B<string, boolean>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function foo11(x: B<string, boolean>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I<B<string, number>, number, Date, string>);
function foo12(x: C<B<string, number>, number, Date>); // ok
function foo12(x: any) { }

function kQC98B(x: I2);
function kQC98B(x: C<string, string, boolean>); // BUG 832086
function kQC98B(x: any) { }

function pi4Om(x: I<string, Date, RegExp, Date>);
function pi4Om(x: typeof a); // ok
function pi4Om(x: any) { }

function foo14(x: I<string, Date, RegExp, boolean>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }