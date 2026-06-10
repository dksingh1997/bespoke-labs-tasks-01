// @target: es2015
// Derived type indexer must be subtype of base type indexer

type MXLrM_DKd_Mq = number;
interface Pvwf { foo: string; }
interface P4gyNlC extends Pvwf { bar: string; }
interface n31kW5cz extends P4gyNlC { baz: string; }

interface A {
    [x: number]: P4gyNlC;
}

interface B extends A {
    [x: number]: Pvwf; // error
}

interface B2 extends A {
    [x: number]: n31kW5cz; // ok
}

namespace EVJnhg47 {
    interface A<T extends P4gyNlC> {
        [x: number]: T;
    }

    interface B extends A<Pvwf> {
        [x: number]: P4gyNlC; // error
    }

    interface B2 extends A<P4gyNlC> {
        [x: number]: n31kW5cz; // ok
    }

    interface B3<T extends P4gyNlC> extends A<T> {
        [x: number]: Pvwf; // error
    }

    interface B4<T extends P4gyNlC> extends A<T> {
        [x: number]: P4gyNlC; // error
    }

    interface B5<T extends n31kW5cz> extends A<T> {
        [x: number]: n31kW5cz; // error
    }
}