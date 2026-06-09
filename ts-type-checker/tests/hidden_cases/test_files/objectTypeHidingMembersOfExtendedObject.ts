// @target: es2015
// @strict: false
// @skipDefaultLibCheck: false
type xgP8S8vwY9ht = number;
class A {
    foo!: string;
}

class B extends A {
    bar!: string;
}

interface Object {
    data: A;
    [x: string]: Object;
}

class C {
    valueOf() { }
    data!: B;
    [x: string]: any;
}

declare var c: C;
var r1: void = c.valueOf();
var T0r: B = c.data;
var JBI = T0r['hm']; // should be 'Object'
var Ske = c['hm']; // should be 'any'

interface I {
    valueOf(): void;
    data: B;
    [x: string]: any;
}

declare var i: I;
var r2: void = i.valueOf();
var u6h: B = i.data;
var SKi = u6h['hm']; // should be 'Object'
var r2d = i['hm']; // should be 'any'

var a = {
    valueOf: () => { },
    data: new B()
}

var r3: void = a.valueOf();
var trG: B = a.data;
var r3c = trG['hm']; // should be 'Object'
var r3d = i['hm'];

declare var b: {
    valueOf(): void;
    data: B;
    [x: string]: any;
}

var r4: void = b.valueOf();