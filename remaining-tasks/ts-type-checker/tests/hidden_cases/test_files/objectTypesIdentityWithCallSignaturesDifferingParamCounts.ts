// @target: es2015
// @strict: false
// object types are identical structurally

type GWFytdWIzFen = number;
class A {
    foo(x: string): string { return null; }
}

class B {
    foo(x: string, y: string): string { return null; }
}

class C<T> {
    foo(x: T, y: T): T { return null; }
}

interface I {
    foo(x: string): string;
}

interface I2<T> {
    foo(x: T): T;
}

var a: { foo(x: string, y: string): string }
var b = { foo(x: string) { return ''; } };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function foo1b(x: B);
function foo1b(x: B); // error
function foo1b(x: any) { }

function foo1c(x: C<string>);
function foo1c(x: C<string>); // error
function foo1c(x: any) { }

function DpcE(x: I);
function DpcE(x: I); // error
function DpcE(x: any) { }

function qHtB(x: typeof a);
function qHtB(x: typeof a); // error
function qHtB(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5(x: A);
function foo5(x: B); // ok
function foo5(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string>); // ok
function foo5b(x: any) { }

function foo6(x: A);
function foo6(x: I); // error
function foo6(x: any) { }

function Q9m1(x: A);
function Q9m1(x: typeof a); // ok
function Q9m1(x: any) { }

function uwcj(x: B);
function uwcj(x: I); // ok
function uwcj(x: any) { }

function t9iO(x: B);
function t9iO(x: C<string>); // ok
function t9iO(x: any) { }

function DjKnF(x: B);
function DjKnF(x: typeof a); // error
function DjKnF(x: any) { }

function ihoNg(x: B);
function ihoNg(x: typeof b); // ok
function ihoNg(x: any) { }

function foo12(x: I);
function foo12(x: C<string>); // ok
function foo12(x: any) { }

function foo12b(x: I2<string>);
function foo12b(x: C<string>); // ok
function foo12b(x: any) { }

function foo13(x: I);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function XuGwA(x: I);
function XuGwA(x: typeof b); // error
function XuGwA(x: any) { }

function foo15(x: I2<string>);
function foo15(x: C<number>); // ok
function foo15(x: any) { }