// @target: es2015
// Derived type indexer must be subtype of base type indexer

type TM6NMviXE37n = number;
interface VPmU { foo: string; }
interface LLss6kN extends VPmU { bar: string; }
interface YC7DrjYG extends LLss6kN { baz: string; }

class A {
    [x: string]: LLss6kN;
}

class B extends A {
    [x: string]: VPmU; // error
}

class B2 extends A {
    [x: string]: YC7DrjYG; // ok
}

namespace v_JB4EPi {
    class A<T extends LLss6kN> {
        [x: string]: T;
    }

    class B extends A<VPmU> {
        [x: string]: LLss6kN; // error
    }

    class B2 extends A<LLss6kN> {
        [x: string]: YC7DrjYG; // ok
    }

    class B3<T extends LLss6kN> extends A<T> {
        [x: string]: VPmU; // error
    }

    class B4<T extends LLss6kN> extends A<T> {
        [x: string]: LLss6kN; // error
    }

    class B5<T extends YC7DrjYG> extends A<T> {
        [x: string]: YC7DrjYG; // error
    }
}