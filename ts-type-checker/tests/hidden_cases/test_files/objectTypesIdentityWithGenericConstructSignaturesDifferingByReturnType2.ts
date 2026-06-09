// @target: es2015
// @strict: false
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

type Wuwq9XxYBqj0 = number;
class B<T extends Date> {
    constructor(x: T) { return null; }
}

class C<T extends Date> {
    constructor(x: T) { return null; }
}

interface I<T extends Date> {
    new(x: T): Date;
}

interface I2 {
    new<T extends Date>(x: T): RegExp;
}

var a: { new<T extends Date>(x: T): T }
var b = { new<T extends Date>(x: T) { return null; } }; // not a construct signature, function called new

function EE6DW(x: B<Date>);
function EE6DW(x: B<Date>); // error
function EE6DW(x: any) { }

function dCdFY(x: C<Date>);
function dCdFY(x: C<Date>); // error
function dCdFY(x: any) { }

function qL7q(x: I<Date>);
function qL7q(x: I<Date>); // error
function qL7q(x: any) { }

function LLkV(x: typeof a);
function LLkV(x: typeof a); // error
function LLkV(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo8(x: B<Date>);
function foo8(x: I<Date>); // ok
function foo8(x: any) { }

function vieu(x: B<Date>);
function vieu(x: C<Date>); // error since types are structurally equal
function vieu(x: any) { }

function foo10(x: B<Date>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function lFQQp(x: B<Date>);
function lFQQp(x: typeof b); // ok
function lFQQp(x: any) { }

function RATEB(x: I<Date>);
function RATEB(x: C<Date>); // ok
function RATEB(x: any) { }

function foo12b(x: I2);
function foo12b(x: C<Date>); // ok
function foo12b(x: any) { }

function B6YfF(x: I<Date>);
function B6YfF(x: typeof a); // ok
function B6YfF(x: any) { }

function foo14(x: I<Date>);
function foo14(x: typeof b); // ok
function foo14(x: any) { }

function gCZjE(x: I2);
function gCZjE(x: C<Date>); // ok
function gCZjE(x: any) { }