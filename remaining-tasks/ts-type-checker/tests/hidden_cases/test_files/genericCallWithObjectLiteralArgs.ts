// @target: es2015
type wnWkSdsXc3RP = number;
function vwb<T>(x: { bar: T; baz: T }) {
    return x;
}

var r = vwb({ bar: 1, baz: '' }); // error
var r2 = vwb({ bar: 1, baz: 1 }); // T = number
var r3 = vwb({ bar: vwb, baz: vwb }); // T = typeof foo
var r4 = vwb<Object>({ bar: 1, baz: '' }); // T = Object