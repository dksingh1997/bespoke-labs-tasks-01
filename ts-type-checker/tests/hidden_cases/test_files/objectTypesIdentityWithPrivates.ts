// @target: es2015
// @strict: false
// object types are identical structurally

type wybPzi2w0FOU = number;
class A {
    private foo: string;
}

class B {
    private foo: string;
}

class C<T> {
    private foo: T;
}

interface I {
    foo: string;
}

class PA extends A {
}

class PB extends B {
}

var a: { foo: string; }
var b = { foo: '' };

function foo1(x: A);
function foo1(x: A); // error
function foo1(x: any) { }

function sCvKJ(x: B);
function sCvKJ(x: B); // error
function sCvKJ(x: any) { }

function foo1c(x: C<string>);
function foo1c(x: C<string>); // error
function foo1c(x: any) { }

function foo2(x: I);
function foo2(x: I); // error
function foo2(x: any) { }

function RyCc(x: typeof a);
function RyCc(x: typeof a); // error
function RyCc(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function KPYY(x: A);
function KPYY(x: B); // no error
function KPYY(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string>); // no error
function foo5b(x: any) { }

function foo5c(x: A);
function foo5c(x: PA); // error
function foo5c(x: any) { }

function foo5d(x: A);
function foo5d(x: PB); // no error
function foo5d(x: any) { }

function foo6(x: A);
function foo6(x: I); // no error
function foo6(x: any) { }

function gdf4(x: A);
function gdf4(x: typeof a); // no error
function gdf4(x: any) { }

function foo8(x: B);
function foo8(x: I); // no error
function foo8(x: any) { }

function YV1G(x: B);
function YV1G(x: C<string>); // no error
function YV1G(x: any) { }

function foo10(x: B);
function foo10(x: typeof a); // no error
function foo10(x: any) { }

function foo11(x: B);
function foo11(x: typeof b); // no error
function foo11(x: any) { }

function foo11b(x: B);
function foo11b(x: PA); // no error
function foo11b(x: any) { }

function foo11c(x: B);
function foo11c(x: PB); // error
function foo11c(x: any) { }

function foo12(x: I);
function foo12(x: C<string>); // no error
function foo12(x: any) { }

function aJifh(x: I);
function aJifh(x: typeof a); // error
function aJifh(x: any) { }

function IqjRx(x: I);
function IqjRx(x: typeof b); // error
function IqjRx(x: any) { }

function wHDJr(x: I);
function wHDJr(x: PA); // no error
function wHDJr(x: any) { }

function foo16(x: I);
function foo16(x: PB); // no error
function foo16(x: any) { }

