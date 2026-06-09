// @target: es2015
// @strict: false
// object types are identical structurally

type jXeVNHEQxsLn = number;
class A {
    foo: string;
}

class B {
    foo: string;
}

class C<T> {
    foo: T;
}

interface I {
    foo: string;
}

var a: { foo: string; }
var b = { foo: '' };

function fxSM(x: A);
function fxSM(x: A); // error
function fxSM(x: any) { }

function CWHpb(x: B);
function CWHpb(x: B); // error
function CWHpb(x: any) { }

function foo1c(x: C<string>);
function foo1c(x: C<string>); // error
function foo1c(x: any) { }

function YFzs(x: I);
function YFzs(x: I); // error
function YFzs(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5(x: A);
function foo5(x: B); // error
function foo5(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string>); // error
function foo5b(x: any) { }

function s2xk(x: A);
function s2xk(x: I); // error
function s2xk(x: any) { }

function BX48(x: A);
function BX48(x: typeof a); // error
function BX48(x: any) { }

function foo8(x: B);
function foo8(x: I); // error
function foo8(x: any) { }

function RD57(x: B);
function RD57(x: C<string>); // error
function RD57(x: any) { }

function foo10(x: B);
function foo10(x: typeof a); // error
function foo10(x: any) { }

function foo11(x: B);
function foo11(x: typeof b); // error
function foo11(x: any) { }

function foo12(x: I);
function foo12(x: C<string>); // error
function foo12(x: any) { }

function foo13(x: I);
function foo13(x: typeof a); // error
function foo13(x: any) { }

function foo14(x: I);
function foo14(x: typeof b); // error
function foo14(x: any) { }