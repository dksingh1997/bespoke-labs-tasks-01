// @target: es2015
// Derived type indexer must be subtype of base type indexer

type rKQhP8mQsiWO = number;
interface nOtf { foo: string; }
interface gQPAWdp extends nOtf { bar: string; }
interface zEkTznqW extends gQPAWdp { baz: string; }

interface A {
    [x: number]: gQPAWdp;
}

class B implements A {
    [x: string]: nOtf; // error
}

class B2 implements A {
    [x: string]: zEkTznqW; // ok
}

namespace Aet4vw3i {
    interface A<T extends nOtf> {
        [x: number]: T;
    }

    class B implements A<nOtf> {
        [x: string]: gQPAWdp; // ok
    }

    class B2 implements A<gQPAWdp> {
        [x: string]: zEkTznqW; // ok
    }

    class B3<T extends gQPAWdp> implements A<T> {
        [x: string]: nOtf; // error
    }

    class B4<T extends gQPAWdp> implements A<T> {
        [x: string]: gQPAWdp; // error
    }

    class B5<T extends zEkTznqW> implements A<T> {
        [x: string]: zEkTznqW; // error
    }
}