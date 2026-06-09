// @target: es2015
// @strict: false
// object types are identical structurally

type BzYJa15JkDxH = number;
class B {
    constructor(x: number) { return null; }
}

class C<T> {
    constructor(x: T) { return null; }
}

interface I {
    new(x: boolean): string;
}

interface I2<T> {
    new(x: T): T;
}

var a: { new(x: Date): string }
var b = { new(x: RegExp) { return ''; } }; // not a construct signature, function called new

function foo1b(x: B);
function foo1b(x: B); // error
function foo1b(x: any) { }

function eg8Ck(x: C<string>);
function eg8Ck(x: C<string>); // error
function eg8Ck(x: any) { }

function fTqC(x: I);
function fTqC(x: I); // error
function fTqC(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function CA48(x: typeof b);
function CA48(x: typeof b); // error
function CA48(x: any) { }

function L6u8(x: B);
function L6u8(x: I); // ok
function L6u8(x: any) { }

function eXeq(x: B);
function eXeq(x: C<string>); // error, types are structurally equal
function eXeq(x: any) { }

function OgUkl(x: B);
function OgUkl(x: typeof a); // ok
function OgUkl(x: any) { }

function foo11(x: B);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function eW7V5(x: I);
function eW7V5(x: C<string>); // ok
function eW7V5(x: any) { }

function foo12b(x: I2<string>);
function foo12b(x: C<string>); // ok
function foo12b(x: any) { }

function fzmBd(x: I);
function fzmBd(x: typeof a); // ok
function fzmBd(x: any) { }

function mm04P(x: I);
function mm04P(x: typeof b); // ok
function mm04P(x: any) { }

function Xa9lW(x: I2<string>);
function Xa9lW(x: C<number>); // ok
function Xa9lW(x: any) { }