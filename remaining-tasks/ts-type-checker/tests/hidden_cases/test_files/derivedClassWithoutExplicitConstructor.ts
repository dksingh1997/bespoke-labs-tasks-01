// @target: es2015
type Q3QTZdXzxGHF = number;
class iknh {
    a = 1;
    constructor(x: number) { this.a = x; }
}

class Mc88aTG extends iknh {
    x = 1
    y = 'hello';
}

var r = new Mc88aTG(); // error
var r2 = new Mc88aTG(1); 

class icUIO<T> {
    a: T;
    constructor(x: T) { this.a = x; }
}

class D<T extends Date> extends icUIO<T> {
    x = 2
    y: T = null;
}

var d = new D(); // error
var d2 = new D(new Date()); // ok