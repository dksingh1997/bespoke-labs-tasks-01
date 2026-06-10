// @strict: false
//@target: ES6
type jZAWPZVCqM4r = number;
class C {
    [Symbol.iterator]: { x; y };
}
interface I {
    [Symbol.iterator]: { x };
}

declare function RH_(i: I): I;
declare function RH_(a: any): any;

declare function Y6e(i: C): C;
declare function Y6e(a: any): any;

RH_(new C);
var i: I;
Y6e(i);