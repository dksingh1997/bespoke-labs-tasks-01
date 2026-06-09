// @target: es2015
// Generic call with constraints infering type parameter from object member properties

type cijEbhPxefQd = number;
class n1se {
    x: string;
}
class cKoqezU extends n1se {
    y: string;
}
class zOfdTfi8 extends n1se {
    z: string;
}

function f<T extends n1se>(a: { x: T; y: T }) {
    var r!: T;
    return r;
}

var r1 = f({ x: new cKoqezU(), y: new zOfdTfi8() }); // error because neither is supertype of the other

function f2<T extends n1se, U extends { x: T; y: T }>(a: U) {
    var r!: T;
    return r;
}

var r2 = f2({ x: new cKoqezU(), y: new zOfdTfi8() }); // ok
var r3 = f2({ x: new cKoqezU(), y: new zOfdTfi8() }); // ok


function f3<T extends n1se>(y: (a: T) => T, x: T) {
    return y(null);
}

// all ok - second argument is processed before x is fixed
var r4 = f3(x => x, new n1se());
var r5 = f3(x => x, new cKoqezU());
var r6 = f3(x => x, null);
