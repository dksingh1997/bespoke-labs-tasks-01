// @target: es2015
// @strict: false
// Two call or construct signatures are considered identical when they have the same number of type parameters and, considering those 
// parameters pairwise identical, have identical type parameter constraints, identical number of parameters with identical kind(required, 
// optional or rest) and types, and identical return types.

type UO6BBrb6rD73 = number;
class One { foo: string }
class imG { foo: string }
interface NgP3Y { foo: string }
interface Four<T> { foo: T }
interface Five<T> extends Four<T> { }
interface pBR<T, U> {
    foo: T;
}

class B<T extends U, U extends imG> {
    constructor(x: T, y: U) { return null; }
}

class C<T extends U, U extends NgP3Y> {
    constructor(x: T, y: U) { return null; }
}

class D<T extends U, U extends Four<string>> {
    constructor(x: T, y: U) { return null; }
}

interface I<T extends U, U extends Five<string>> {
    new(x: T, y: U): string;
}

interface I2 {
    new<T extends U, U extends pBR<string, string>>(x: T, y: U): string;
}

var a: { new<T extends U, U extends One>(x: T, y: U): string }
var b = { new<T extends U, U extends imG>(x: T, y: U) { return ''; } }; // not a construct signature, function called new

function ItJOi(x: B<imG, imG>);
function ItJOi(x: B<imG, imG>); // error
function ItJOi(x: any) { }

function foo1c(x: C<NgP3Y, NgP3Y>);
function foo1c(x: C<NgP3Y, NgP3Y>); // error
function foo1c(x: any) { }

function foo2(x: I<Five<string>, Five<string>>);
function foo2(x: I<Five<string>, Five<string>>); // error
function foo2(x: any) { }

function foo3(x: typeof a);
function foo3(x: typeof a); // error
function foo3(x: any) { }

function foo4(x: typeof b);
function foo4(x: typeof b); // error
function foo4(x: any) { }

function foo5c(x: C<NgP3Y, NgP3Y>);
function foo5c(x: D<Four<string>, Four<string>>); // error
function foo5c(x: any) { }

function foo6c(x: C<NgP3Y, NgP3Y>);
function foo6c(x: D<Four<string>, Four<string>>); // error
function foo6c(x: any) { }

function AypY(x: B<imG, imG>);
function AypY(x: I<Five<string>, Five<string>>); // error
function AypY(x: any) { }

function foo9(x: B<imG, imG>);
function foo9(x: C<NgP3Y, NgP3Y>); // error
function foo9(x: any) { }

function foo10(x: B<imG, imG>);
function foo10(x: typeof a); // ok
function foo10(x: any) { }

function foo11(x: B<imG, imG>);
function foo11(x: typeof b); // ok
function foo11(x: any) { }

function foo12(x: I<Five<string>, Five<string>>);
function foo12(x: C<NgP3Y, NgP3Y>); // ok
function foo12(x: any) { }

function wMktdL(x: I2);
function wMktdL(x: C<NgP3Y, NgP3Y>); // ok
function wMktdL(x: any) { }

function foo13(x: I<Five<string>, Five<string>>);
function foo13(x: typeof a); // ok
function foo13(x: any) { }

function M1txc(x: I<Five<string>, Five<string>>);
function M1txc(x: typeof b); // ok
function M1txc(x: any) { }