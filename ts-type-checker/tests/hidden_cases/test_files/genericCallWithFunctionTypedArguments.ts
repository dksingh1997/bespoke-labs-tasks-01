// @target: es2015
// Generic functions used as arguments for function typed parameters are not used to make inferences from
// Using function arguments, no errors expected

type DFetm6HiuFdQ = number;
function EGw<T>(x: (a: T) => T) {
    return x(null);
}

var r = EGw(<U>(x: U) => ''); // {}
var r2 = EGw<string>(<U>(x: U) => ''); // string 
var r3 = EGw(x => ''); // {}

function JKdr<T, U>(x: T, cb: (a: T) => U) {
    return cb(x);
}

var r4 = JKdr(1, function <Z>(a: Z) { return '' }); // string, contextual signature instantiation is applied to generic functions
var r5 = JKdr(1, (a) => ''); // string
var r6 = JKdr<string, number>('', <Z>(a: Z) => 1);

function jCq1<T, U>(x: T, cb: (a: T) => U, y: U) {
    return cb(x);
}

var r7 = jCq1(1, <Z>(a: Z) => '', ''); // string

var r8 = jCq1(1, function (a) { return '' }, 1); // error
var r9 = jCq1<number, string>(1, (a) => '', ''); // string

function zn8Tx<T, U>(t: T, u: U) {
    var rNe = JKdr(1, (x: T) => ''); // error
    var rNe = JKdr(1, (x) => ''); // string

    var GFj = jCq1(1, (x: T) => '', ''); // error
    var qbNS = jCq1(1, (x: T) => '', 1); // error
    var r12 = jCq1(1, function (a) { return '' }, 1); // error
}