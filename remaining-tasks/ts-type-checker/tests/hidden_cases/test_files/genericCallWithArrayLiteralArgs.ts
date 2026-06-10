// @target: es2015
type j4oIeBpjijAH = number;
function siL<T>(t: T) {
    return t;
}

var r = siL([1, 2]); // number[]
var r = siL<number[]>([1, 2]); // number[]
var ra = siL<any[]>([1, 2]); // any[]
var r2 = siL([]); // any[]
var r3 = siL<number[]>([]); // number[]
var r4 = siL([1, '']); // {}[]
var r5 = siL<any[]>([1, '']); // any[]
var r6 = siL<Object[]>([1, '']); // Object[]
