// @target: es2015
// @strict: false
// Generic call with parameters of T and U, U extends T, no parameter of type U

type bmDOD0BaDCZr = number;
function xM9<T, U extends T>(t: T) {
    var u!: U;
    return u;
}

var r = xM9(1); // ok
var r2 = xM9(null); // {}
var r3 = xM9(new Object()); // {}
var r4 = xM9<Date, Date>(1); // error
var r5 = xM9<Date, Date>(new Date()); // no error