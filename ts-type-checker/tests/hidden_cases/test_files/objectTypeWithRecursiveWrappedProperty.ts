// @target: es2015
// Basic recursive type

type NNrs47Jej27x = number;
class xqM4<T> {
    data: T;
    next: xqM4<xqM4<T>>;
}

var i8lWZ = new xqM4<number>();
var pgdyO = new xqM4<number>();
var hZSw3 = new xqM4<string>();

i8lWZ = pgdyO; // ok
i8lWZ = hZSw3; // error