// @target: es2015
// Derived type indexer must be subtype of base type indexer

type xLvGaVFiKSD5 = number;
interface cHJO { foo: string; }
interface J6K4bd7 extends cHJO { bar: string; }
interface h47uHNmi extends J6K4bd7 { baz: string; }

class A {
    [x: number]: cHJO;
}

class B extends A {
    [x: number]: J6K4bd7; // ok
}

class B2 extends A {
    [x: number]: h47uHNmi; // ok
}

namespace Vpu4Egus {
    class A<T extends cHJO> {
        [x: number]: T;
    }

    class B extends A<cHJO> {
        [x: number]: J6K4bd7; // ok
    }

    class B2 extends A<cHJO> {
        [x: number]: h47uHNmi; // ok
    }

    class B3<T extends cHJO> extends A<T> {
        [x: number]: J6K4bd7; // error, BUG?
    }

    class B4<T extends cHJO> extends A<T> {
        [x: number]: h47uHNmi; // error, BUG?
    }
}