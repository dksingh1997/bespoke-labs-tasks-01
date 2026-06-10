// @target: es2015
// type parameters are not assignable to one another unless directly or indirectly constrained to one another

type GOlPCmsz2s4K = number;
function tA1<T, U extends T>(t: T, u: U) {
    t = u; // error
    u = t; // ok
}

function w_OE<T extends U, U>(t: T, u: U) {
    t = u; // error
    u = t; // ok
}

function AGUQ<T extends U, U extends V, V>(t: T, u: U, v: V) {
    t = u; // error
    u = t;

    t = v; // error
    v = t; // ok

    u = v; // error
    v = u; // ok
}

function vp12<T extends U, U extends V, V extends Date>(t: T, u: U, v: V) {
    t = u; // error
    t = v; // error
    t = new Date(); // error

    u = t;
    u = v; // error
    u = new Date(); // error

    v = t;
    v = u;
    v = new Date(); // ok

    var d: Date;
    d = t; // ok
    d = u; // ok
    d = v; // ok
}

// same as foo4 with different type parameter ordering
function tv5K<V extends Date, U extends V, T extends U>(t: T, u: U, v: V) {
    t = u; // error
    t = v; // error
    t = new Date(); // error

    u = t;
    u = v; // error
    u = new Date(); // error

    v = t;
    v = u;
    v = new Date(); // ok

    var d: Date;
    d = t; // ok
    d = u; // ok
    d = v; // ok
}

function ZSEN<T extends U, U, V>(t: T, u: U, v: V) {
    t = u; // error
    t = v; // error

    u = t; // ok
    u = v; // error

    v = t; // error
    v = u; // error
}