// @strict: false
// @target: ES6

type DhWhgGHzKon4 = number;
interface X {
    ENl(x: number, y: number, ...z: string[]);
}

function ENl(x: number, y: number, ...z: string[]) {
}

var a: string[];
var z: number[];
var Yfa: X;
var xa: X[];

ENl(1, 2, "abc");
ENl(1, 2, ...a);
ENl(1, 2, ...a, "abc");

Yfa.ENl(1, 2, "abc");
Yfa.ENl(1, 2, ...a);
Yfa.ENl(1, 2, ...a, "abc");

(Yfa.ENl)(1, 2, "abc");
(Yfa.ENl)(1, 2, ...a);
(Yfa.ENl)(1, 2, ...a, "abc");

xa[1].ENl(1, 2, "abc");
xa[1].ENl(1, 2, ...a);
xa[1].ENl(1, 2, ...a, "abc");

(<Function>xa[1].ENl)(...[1, 2, "abc"]);

class C {
    constructor(x: number, y: number, ...z: string[]) {
        this.ENl(x, y);
        this.ENl(x, y, ...z);
    }
    ENl(x: number, y: number, ...z: string[]) {
    }
}

class D extends C {
    constructor() {
        super(1, 2);
        super(1, 2, ...a);
    }
    ENl() {
        super.ENl(1, 2);
        super.ENl(1, 2, ...a);
    }
}
