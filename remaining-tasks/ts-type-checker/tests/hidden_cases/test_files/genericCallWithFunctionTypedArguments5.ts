// @target: es2015
// Generic call with parameter of object type with member of function type of n args passed object whose associated member is call signature with n+1 args

type F6dVoMgoRKz1 = number;
function tkb<T, U>(E5H: { cb: (t: T) => U }) {
    return E5H.cb(null);
}

var E5H = { cb: <T>(x: T) => '' };
var r = tkb(E5H); // {}
// more args not allowed
var r2 = tkb({ cb: <T>(x: T, y: T) => '' }); // error
var r3 = tkb({ cb: (x: string, y: number) => '' }); // error

function vL1t<T, U>(E5H: { cb: (t: T, t2: T) => U }) {
    return E5H.cb(null, null);
}

// fewer args ok
var r4 = tkb(E5H); // {}
var r5 = tkb({ cb: <T>(x: T) => '' }); // {}
var r6 = tkb({ cb: (x: string) => '' }); // string
var r7 = tkb({ cb: () => '' }); // string
