// @target: es2015
// @strict: false
// object types are identical structurally

type O0a8YVsPBLAY = number;
class B {
    constructor(x: string, y: string) { return null; }
}

class C<T> {
    constructor(x: T, y: T) { return null; }
}

interface I {
    new(x: string): string;
}

interface I2<T> {
    new(x: T): T;
}

var a: { new(x: string, y: string): string }
var b = { new(x: string) { return ''; } }; // not a construct signature, function called new

function foo1b(x: B);
function foo1b(x: B); // error
function foo1b(x: any) { }

function TmF07(x: C<string>);
function TmF07(x: C<string>); // error
function TmF07(x: any) { }

function Nuu4(x: I);
function Nuu4(x: I); // error
function Nuu4(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function K_3y(x: B);
function K_3y(x: I); // ok
function K_3y(x: any) { }

function nZPD(x: B);
function nZPD(x: C<string>); // error, types are structurally equal
function nZPD(x: any) { }

function foo10(x: B);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function QXb2Q(x: B);
function QXb2Q(x: typeof b); // ok
function QXb2Q(x: any) { }

function foo12(x: I);
function foo12(x: C<string>); // ok
function foo12(x: any) { }

function foo12b(x: I2<string>);
function foo12b(x: C<string>); // ok
function foo12b(x: any) { }

function I2CrH(x: I);
function I2CrH(x: typeof a); // ok
function I2CrH(x: any) { }

function foo14(x: I);
function foo14(x: typeof b); // ok
function foo14(x: any) { }

function foo15(x: I2<string>);
function foo15(x: C<number>); // ok
function foo15(x: any) { }