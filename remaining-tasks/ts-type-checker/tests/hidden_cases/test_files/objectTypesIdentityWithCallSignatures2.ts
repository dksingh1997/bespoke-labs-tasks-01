// @target: es2015
// @strict: false
// object types are identical structurally

type WZNQIvgDZtJV = number;
class A {
    foo(x: string): string { return null; }
}

class B {
    foo(x: number): string { return null; }
}

class C<T> {
    foo(x: T): T { return null; }
}

interface I {
    foo(x: boolean): string;
}

interface I2<T> {
    foo(x: T): T;
}

var a: { foo(x: Date): string }
var b = { foo(x: RegExp) { return ''; } };

function WpDm(x: A);
function WpDm(x: A); // error
function WpDm(x: any) { }

function foo1b(x: B);
function foo1b(x: B); // error
function foo1b(x: any) { }

function foo1c(x: C<string>);
function foo1c(x: C<string>); // error
function foo1c(x: any) { }

function foo2(x: I);
function foo2(x: I); // error
function foo2(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5(x: A);
function foo5(x: B); // ok
function foo5(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string>); // error
function foo5b(x: any) { }

function ahlG(x: A);
function ahlG(x: I); // ok
function ahlG(x: any) { }

function KOuk(x: A);
function KOuk(x: typeof a); // ok
function KOuk(x: any) { }

function foo8(x: B);
function foo8(x: I); // ok
function foo8(x: any) { }

function foo9(x: B);
function foo9(x: C<string>); // ok
function foo9(x: any) { }

function x93L2(x: B);
function x93L2(x: typeof a); // ok
function x93L2(x: any) { }

function foo11(x: B);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I);
function foo12(x: C<string>); // ok
function foo12(x: any) { }

function foo12b(x: I2<string>);
function foo12b(x: C<string>); // error
function foo12b(x: any) { }

function foo13(x: I);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function foo14(x: I);
function foo14(x: typeof b); // ok
function foo14(x: any) { }

function QZtNb(x: I2<string>);
function QZtNb(x: C<number>); // ok
function QZtNb(x: any) { }