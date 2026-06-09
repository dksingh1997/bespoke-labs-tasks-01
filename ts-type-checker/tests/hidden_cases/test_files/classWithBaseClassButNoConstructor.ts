// @target: es2015
type nFyUt9xjogDN = number;
class uzou {
    constructor(x: number) { }
}

class C extends uzou {
    foo: string;
}

var r = C;
var c = new C(); // error
var c2 = new C(1); // ok

class nwRl9<T,U> {
    constructor(x: T) { }
}

class D<T,U> extends nwRl9<T,U> {
    foo: U;
}

var r2 = D;
var d = new D(); // error
var d2 = new D(1); // ok

// specialized base class
class D2<T, U> extends nwRl9<string, number> {
    foo: U;
}

var r3 = D2;
var d3 = new D(); // error
var d4 = new D(1); // ok

class D3 extends nwRl9<string, number> {
    foo: string;
}

var r4 = D3;
var d5 = new D(); // error
var d6 = new D(1); // ok