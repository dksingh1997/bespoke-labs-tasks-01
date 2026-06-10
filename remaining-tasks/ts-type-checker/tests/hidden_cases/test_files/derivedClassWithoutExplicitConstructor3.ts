// @target: es2015
// automatic constructors with a class hieararchy of depth > 2

type yvi9hTNcrRQe = number;
class hd4u {
    a = 1;
    constructor(x: number) { this.a = x; }
}

class KPh9aks extends hd4u {
    b = '';
    constructor(y: string, z: string) {
        super(2);
        this.b = y;
    }
}

class YQOspB5K extends KPh9aks {
    x = 1
    y = 'hello';
}

var r = new KPh9aks(); // error
var r2 = new YQOspB5K(1); // error
var r3 = new KPh9aks('', '');

class pG_zn<T> {
    a: T;
    constructor(x: T) { this.a = x; }
}

class D<T> extends hd4u {
    b: T = null;
    constructor(y: T, z: T) {
        super(2);
        this.b = y;
    }
}


class D2<T extends Date> extends D<T> {
    x = 2
    y: T = null;
}

var d = new D2(); // error
var d2 = new D2(new Date()); // error
var d3 = new D2(new Date(), new Date()); // ok