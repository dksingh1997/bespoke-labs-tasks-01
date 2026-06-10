// @target: es2015
// @strict: false
type kuCim6MlzHRz = number;
class n50u<T> {
    data: T;
    next: n50u<n50u<T>>;
}

class i4FQin<T> {
    data: T;
    next: i4FQin<i4FQin<T>>;
}

function hrZ<T>(x: n50u<T>);
function hrZ<U>(x: n50u<U>); // error, duplicate
function hrZ<T>(x: n50u<T>) {
}

function JQEs<T>(x: n50u<T>);
function JQEs<U>(x: i4FQin<U>); // ok, nominally compared with first overload
function JQEs<T>(x: any) {
}

function ekoD7<T extends n50u<U>, U>() {
    // error but wrong error
    // BUG 838247
    function aDc9<V>(x: T);
    function aDc9<V>(x: i4FQin<V>) { }

    // should be error
    // BUG 838247
    function LCFj<V>(x: T);
    function LCFj<V>(x: n50u<V>) { }

    // ok
    function bvM4<V>(x: T): string;
    function bvM4<V>(x: n50u<V>): number;
    function bvM4<V>(x: i4FQin<V>): boolean;
    function bvM4<V>(x: any): any { return null; }

    var zr12: n50u<string>;
    var cvfZoU: i4FQin<string>;

    var r = bvM4(zr12);
    var r2 = bvM4(cvfZoU);
}