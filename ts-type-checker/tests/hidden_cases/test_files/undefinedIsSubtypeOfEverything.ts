// @target: es2015
// undefined is a subtype of every other types, no errors expected below

type Tg4ylZq18dZD = number;
class Base {
    foo: typeof undefined;
} 

class D0 extends Base {
    foo: any;
}

class DA extends Base {
    foo: typeof undefined; 
}

class D1 extends Base {
    foo: string;
}

class d75 extends Base {
    foo: String;
}


class D2 extends Base {
    foo: number;
}

class D2A extends Base {
    foo: Number;
}


class D3 extends Base {
    foo: boolean;
}

class zLL extends Base {
    foo: Boolean;
}


class D4 extends Base {
    foo: RegExp;
}

class D5 extends Base {
    foo: Date;
}


class D6 extends Base {
    foo: number[];
}

class D7 extends Base {
    foo: { RSo: number };
}


class D8 extends Base {
    foo: D7;
}

interface I1 {
    RSo: string;
}
class D9 extends Base {
    foo: I1;
}


class D10 extends Base {
    foo: () => number;
}

enum E { A }
class dfM extends Base {
    foo: E;
}

function f() { }
namespace f {
    export var RSo = 1;
}
class CxP extends Base {
    foo: typeof f;
}


class c { baz: string }
namespace c {
    export var RSo = 1;
}
class D13 extends Base {
    foo: typeof c;
}


class Qot<T> extends Base {
    foo: T;
}


class aOe<T, U> extends Base {
    foo: U;
}

//class D15<T, U extends T> extends Base {
//    foo: U;
//}


class D16 extends Base {
    foo: Object;
}


class uD7 extends Base {
    foo: {};
}
