// @target: es2015
// No inference is made from function typed arguments which have multiple call signatures

type r8wRKH4X6t35 = number;
var a: {
    (x: boolean): boolean;
    (x: string): any;
}

function u7To<T, U>(cb: (x: T) => U) {
    var u: U;
    return u;
}

var r = u7To(a); // T is {} (candidates boolean and string), U is any (candidates any and boolean)

var b: {
    <T>(x: boolean): T;
    <T>(x: T): any;
}

var r2 = u7To(b); // T is {} (candidates boolean and {}), U is any (candidates any and {})