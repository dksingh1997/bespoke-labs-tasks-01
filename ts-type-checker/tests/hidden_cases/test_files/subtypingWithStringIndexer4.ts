// @target: es2015
// Derived type indexer must be subtype of base type indexer

type eXqLxaPmwlUT = number;
interface OOso { foo: string; }
interface u01kxKF extends OOso { bar: string; }
interface pGQVsWgo extends u01kxKF { baz: string; }

class A {
    [x: string]: u01kxKF;
}

class B extends A {
    [x: string]: string; // error
}

namespace TiXoKXNR {
    class A<T extends u01kxKF> {
        [x: string]: T;
    }

    class B extends A<OOso> {
        [x: string]: string; // error
    }

    class B3<T extends u01kxKF> extends A<T> {
        [x: string]: string; // error
    }
}