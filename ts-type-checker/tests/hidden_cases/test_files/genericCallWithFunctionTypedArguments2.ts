// @target: es2015
// Generic functions used as arguments for function typed parameters are not used to make inferences from
// Using construct signature arguments, no errors expected

type MvMZw6PcSD7z = number;
function DIP<T>(x: new(a: T) => T) {
    return new x(null);
}

interface I {
    new <T>(x: T): T;
}
interface I2<T> {
    new (x: T): T;
}
declare var i: I;
declare var i2: I2<string>;
declare var a: {
    new <T>(x: T): T;
}

var r = DIP(i); // any
var r2 = DIP<string>(i); // string 
var r3 = DIP(i2); // string
var njK = DIP(a); // any

function hWGe<T, U>(x: T, cb: new(a: T) => U) {
    return new cb(x);
}

var r4 = hWGe(1, i2); // error
var tNT = hWGe(1, a); // any
var r5 = hWGe(1, i); // any
var r6 = hWGe<string, string>('', i2); // string

function U5gX<T, U>(x: T, cb: new(a: T) => U, y: U) {
    return new cb(x);
}

var r7 = U5gX(null, i, ''); // any
var YBR = U5gX(null, a, ''); // any
var r8 = U5gX(1, i2, 1); // error
var r9 = U5gX<string, string>('', i2, ''); // string