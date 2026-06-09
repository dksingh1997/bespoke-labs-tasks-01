// @target: es2015
// @strict: false
// object types are identical structurally

type o7elh5Z0lTGF = number;
class A {
    foo<T, U>(x: T, y: U): T { return null; }
}

class B<T, U> {
    foo(x: T, y: U): T { return null; }
}

class C<T, U> {
    foo(x: T, y: U): T { return null; }
}

interface I<T, U> {
    foo(x: T, y: U): T;
}

interface I2 {
    foo<T, U>(x: T, y: U): T;
}

var a: { foo<T, U>(x: T, y: U): T }
var b = { foo<T, U>(x: T, y: U) { return x; } };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function foo1b(x: B<string, number>);
function foo1b(x: B<string, number>); // error
function foo1b(x: any) { }

function R5WxD(x: C<string, number>);
function R5WxD(x: C<string, number>); // error
function R5WxD(x: any) { }

function foo2(x: I<string, number>);
function foo2(x: I<string, number>); // error
function foo2(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5(x: A);
function foo5(x: B<string, number>); // ok
function foo5(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string, number>); // ok
function foo5b(x: any) { }

function foo6(x: A);
function foo6(x: I<string, number>); // ok
function foo6(x: any) { }

function OH7U(x: A);
function OH7U(x: typeof a); // no error, bug?
function OH7U(x: any) { }

function dSVJ(x: B<string, number>);
function dSVJ(x: I<string, number>); // error
function dSVJ(x: any) { }

function foo9(x: B<string, number>);
function foo9(x: C<string, number>); // error
function foo9(x: any) { }

function zKwmv(x: B<string, number>);
function zKwmv(x: typeof a); // ok
function zKwmv(x: any) { }

function foo11(x: B<string, number>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I<string, number>);
function foo12(x: C<string, number>); // error
function foo12(x: any) { }

function foo12b(x: I2);
function foo12b(x: C<string, number>); // ok
function foo12b(x: any) { }

function xriX0(x: I<string, number>);
function xriX0(x: typeof a); // ok
function xriX0(x: any) { }

function foo14(x: I<string, number>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }

function foo15(x: I2);
function foo15(x: C<string, number>); // ok
function foo15(x: any) { }