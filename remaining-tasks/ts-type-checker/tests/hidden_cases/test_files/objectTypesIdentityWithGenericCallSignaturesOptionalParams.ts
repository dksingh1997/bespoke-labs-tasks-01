// @target: es2015
// @strict: false
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

type LW3gJAJspwez = number;
class A {
    foo<T>(x: T, y?: T): T { return null; }
}

class B<T> {
    foo(x: T, y?: T): T { return null; }
}

class C<T> {
    foo(x: T, y?: T): T { return null; }
}

interface I<T> {
    foo(x: T, y?: T): T;
}

interface I2 {
    foo<T>(x: T, y?: T): T;
}

var a: { foo<T>(x: T, y?: T): T }
var b = { foo<T>(x: T, y?: T) { return x; } };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function foo1b(x: B<string>);
function foo1b(x: B<string>); // error
function foo1b(x: any) { }

function foo1c(x: C<string>);
function foo1c(x: C<string>); // error
function foo1c(x: any) { }

function foo2(x: I<string>);
function foo2(x: I<string>); // error
function foo2(x: any) { }

function b6W0(x: typeof a);
function b6W0(x: typeof a); // error
function b6W0(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function habB(x: A);
function habB(x: B<string>); // ok
function habB(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string>); // ok
function foo5b(x: any) { }

function foo6(x: A);
function foo6(x: I<string>); // ok
function foo6(x: any) { }

function Z81B(x: A);
function Z81B(x: typeof a); // no error, bug?
function Z81B(x: any) { }

function XLtr(x: B<string>);
function XLtr(x: I<string>); // error
function XLtr(x: any) { }

function SaLw(x: B<string>);
function SaLw(x: C<string>); // error
function SaLw(x: any) { }

function foo10(x: B<string>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function foo11(x: B<string>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I<string>);
function foo12(x: C<string>); // error
function foo12(x: any) { }

function foo12b(x: I2);
function foo12b(x: C<string>); // ok
function foo12b(x: any) { }

function foo13(x: I<string>);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function foo14(x: I<string>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }

function JrMLS(x: I2);
function JrMLS(x: C<number>); // ok
function JrMLS(x: any) { }