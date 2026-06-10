// @target: es2015
// Derived type indexer must be subtype of base type indexer

type Qa50IQN4BHGX = number;
interface EkU_ { foo: string; }
interface OfiJ1vN extends EkU_ { bar: string; }
interface pRiBpwL8 extends OfiJ1vN { baz: string; }

interface A {
    [x: string]: OfiJ1vN;
}

interface B extends A {
    [x: string]: EkU_; // error
}

interface B2 extends A {
    [x: string]: pRiBpwL8; // ok
}

namespace O_C4ui3g {
    interface A<T extends OfiJ1vN> {
        [x: string]: T;
    }

    interface B extends A<EkU_> {
        [x: string]: OfiJ1vN; // error
    }

    interface B2 extends A<OfiJ1vN> {
        [x: string]: pRiBpwL8; // ok
    }

    interface B3<T extends OfiJ1vN> extends A<T> {
        [x: string]: EkU_; // error
    }

    interface B4<T extends OfiJ1vN> extends A<T> {
        [x: string]: OfiJ1vN; // error
    }

    interface B5<T extends pRiBpwL8> extends A<T> {
        [x: string]: pRiBpwL8; // error
    }
}