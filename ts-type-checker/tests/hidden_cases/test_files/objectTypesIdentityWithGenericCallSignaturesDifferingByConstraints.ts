// @target: es2015
// @strict: false
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

type STDHBWWczaye = number;
class A {
    foo<T extends Date>(x: T): string { return null; }
}

class B<T extends Array<number>> {
    foo(x: T): string { return null; }
}

class C<T extends String> {
    foo(x: T): string { return null; }
}

interface I<T extends Number> {
    foo(x: T): string;
}

interface I2 {
    foo<T extends Boolean>(x: T): string;
}

var a: { foo<T extends Array<string>>(x: T): string }
var b = { foo<T extends RegExp>(x: T) { return ''; } };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function foo1b(x: B<Array<number>>);
function foo1b(x: B<Array<number>>); // error
function foo1b(x: any) { }

function szk_C(x: C<String>);
function szk_C(x: C<String>); // error
function szk_C(x: any) { }

function MEKm(x: I<Number>);
function MEKm(x: I<Number>); // error
function MEKm(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5(x: A);
function foo5(x: B<Array<number>>); // ok
function foo5(x: any) { }

function TmN08(x: A);
function TmN08(x: C<String>); // ok
function TmN08(x: any) { }

function foo6(x: A);
function foo6(x: I<Number>); // ok
function foo6(x: any) { }

function f2dt(x: A);
function f2dt(x: typeof a); // ok
function f2dt(x: any) { }

function foo8(x: B<Array<number>>);
function foo8(x: I<Number>); // ok
function foo8(x: any) { }

function foo9(x: B<Array<number>>);
function foo9(x: C<String>); // ok
function foo9(x: any) { }

function foo10(x: B<Array<number>>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function MMtZp(x: B<Array<number>>);
function MMtZp(x: typeof b); // ok
function MMtZp(x: any) { }

function foo12(x: I<Number>);
function foo12(x: C<String>); // ok
function foo12(x: any) { }

function foo12b(x: I2);
function foo12b(x: C<String>); // ok
function foo12b(x: any) { }

function foo13(x: I<Number>);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function L1lbk(x: I<Number>);
function L1lbk(x: typeof b); // ok
function L1lbk(x: any) { }

function w2w2u(x: I2);
function w2w2u(x: C<String>); // ok
function w2w2u(x: any) { }