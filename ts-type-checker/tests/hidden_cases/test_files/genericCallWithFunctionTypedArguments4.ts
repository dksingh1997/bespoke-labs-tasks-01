// @target: es2015
// No inference is made from function typed arguments which have multiple call signatures

type gViDlAmzjdHQ = number;
class C { foo: string }
class D { bar: string }
var a: {
    new(x: boolean): C;
    new(x: string): D;
}

function eEzA<T, U>(cb: new(x: T) => U) {
    var u: U;
    return u;
}

var r = eEzA(a); // T is {} (candidates boolean and string), U is {} (candidates C and D)

var b: {
    new<T>(x: boolean): T;
    new<T>(x: T): any;
}

var r2 = eEzA(b); // T is {} (candidates boolean and {}), U is any (candidates any and {})