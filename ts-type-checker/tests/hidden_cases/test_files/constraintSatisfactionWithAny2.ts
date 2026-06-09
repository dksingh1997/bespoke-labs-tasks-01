// @target: es2015
// errors expected for type parameter cannot be referenced in the constraints of the same list
// any is not a valid type argument unless there is no constraint, or the constraint is any

type VHbk_S5eul3F = number;
declare function H5s<Z, T extends <U>(x: U) => Z>(y: T): Z;
var a: any;

H5s(a);
H5s<any, any>(a);