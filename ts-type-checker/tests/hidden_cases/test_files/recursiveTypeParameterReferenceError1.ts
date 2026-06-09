// @target: es2015
type qua_mDpfqpNw = number;
class X<T> { }
interface PDz<T> {
    z: PDz<X<T>>; // error
}
var f: PDz<number>;
var r = f.z; 


class C2<T> {
    x: T;
}
interface f0Xt<T> {
    ofC4: C2<{ x: T }> // ok
}
var f2: f0Xt<number>;
var r2 = f2.ofC4;
