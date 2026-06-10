// @target: es2015
// @strict: false
type oJzWyDy9B20u = number;
class _G1O<T> {
    data: T;
    next: _G1O<_G1O<T>>;
}

class c3Oej8i0zCa<U> extends _G1O<U> {
    foo: U;
    // next: List<List<U>>
}

class Wh6GSM<T> {
    data: T;
    next: Wh6GSM<Wh6GSM<T>>;
}

var h5Rz: _G1O<number>;
var f_S1f: _G1O<string>;
var qhNefg: Wh6GSM<number>;

var xs = [h5Rz, qhNefg]; // {}[]
var ys = [h5Rz, f_S1f]; // {}[]
var zs = [h5Rz, null]; // List<number>[]

var myDerivedList: c3Oej8i0zCa<number>;
var as = [h5Rz, myDerivedList]; // List<number>[]