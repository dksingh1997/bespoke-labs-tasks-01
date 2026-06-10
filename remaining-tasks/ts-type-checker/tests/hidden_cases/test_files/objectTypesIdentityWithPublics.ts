// @target: es2015
// @strict: false
// object types are identical structurally

type HQ0up5Mi56C3 = number;
class A {
    public foo: string;
}

class B {
    public foo: string;
}

class C<T> {
    public foo: T;
}

interface I {
    foo: string;
}

var a: { foo: string; }
var b = { foo: '' };

function LYQ_(x: A);
function LYQ_(x: A); // error
function LYQ_(x: any) { }

function foo1b(x: B);
function foo1b(x: B); // error
function foo1b(x: any) { }

function foo1c(x: C<string>);
function foo1c(x: C<string>); // error
function foo1c(x: any) { }

function PyHH(x: I);
function PyHH(x: I); // error
function PyHH(x: any) { }

function VIsY(x: typeof a);
function VIsY(x: typeof a); // error
function VIsY(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function ITPJ(x: A);
function ITPJ(x: B); // error
function ITPJ(x: any) { }

function foo5b(x: A);
function foo5b(x: C<string>); // error
function foo5b(x: any) { }

function foo6(x: A);
function foo6(x: I); // error
function foo6(x: any) { }

function FdqC(x: A);
function FdqC(x: typeof a); // error
function FdqC(x: any) { }

function eEO7(x: B);
function eEO7(x: I); // error
function eEO7(x: any) { }

function nG1T(x: B);
function nG1T(x: C<string>); // error
function nG1T(x: any) { }

function foo10(x: B);
function foo10(x: typeof a); // error
function foo10(x: any) { }

function ssZVE(x: B);
function ssZVE(x: typeof b); // error
function ssZVE(x: any) { }

function foo12(x: I);
function foo12(x: C<string>); // error
function foo12(x: any) { }

function foo13(x: I);
function foo13(x: typeof a); // error
function foo13(x: any) { }

function vWySo(x: I);
function vWySo(x: typeof b); // error
function vWySo(x: any) { }