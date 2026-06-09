// @target: es2015
// @strict: false
// object types are identical structurally

type hZua1nsDBXJR = number;
class A {
    foo<T>(x: T): T { return null; }
}

class B<U, V> {
    foo(x: U): U { return null; }
}

class C<V, W, X> {
    foo(x: V): V { return null; }
}

interface I<X, Y, Z, A> {
    foo(x: X): X;
}

interface I2 {
    foo<Y, Z, A, B>(x: Y): Y;
}

var a: { foo<Z, A, B, C, D>(x: Z): Z }
var b = { foo<A, B, C, D, E, F>(x: A) { return x; } };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function foo1b(x: B<string, string>);
function foo1b(x: B<string, string>); // error
function foo1b(x: any) { }

function xp9ik(x: C<string, number, boolean>);
function xp9ik(x: C<string, number, boolean>); // error
function xp9ik(x: any) { }

function B0uz(x: I<string, boolean, number, string>);
function B0uz(x: I<string, boolean, number, string>); // error
function B0uz(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function xYM8(x: typeof b);
function xYM8(x: typeof b); // error
function xYM8(x: any) { }

function Y9ZO(x: A);
function Y9ZO(x: B<string, string>); // ok
function Y9ZO(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string, number, boolean>); // ok
function foo5b(x: any) { }

function foo6(x: A);
function foo6(x: I<string, number, boolean, Date>); // ok
function foo6(x: any) { }

function GSYl(x: A);
function GSYl(x: typeof a); // no error, bug?
function GSYl(x: any) { }

function RBAy(x: B<string, string>);
function RBAy(x: I<string, string, boolean, Date>); // error
function RBAy(x: any) { }

function foo9(x: B<string, number>);
function foo9(x: C<string, number, B<string, string>>); // error
function foo9(x: any) { }

function foo10(x: B<string, boolean>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function q6G9Q(x: B<string, boolean>);
function q6G9Q(x: typeof b); // ok
function q6G9Q(x: any) { }

function foo12(x: I<B<string, number>, number, Date, string>);
function foo12(x: C<B<string, number>, number, Date>); // error
function foo12(x: any) { }

function foo12b(x: I2);
function foo12b(x: C<string, string, boolean>); // ok
function foo12b(x: any) { }

function foo13(x: I<string, Date, RegExp, Date>);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function Rexmu(x: I<string, Date, RegExp, boolean>);
function Rexmu(x: typeof b); // ok
function Rexmu(x: any) { }

function N_0DZ(x: I2);
function N_0DZ(x: C<number, B<string, string>, B<number, string>>); // ok
function N_0DZ(x: any) { }