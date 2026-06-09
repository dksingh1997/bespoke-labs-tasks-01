// @target: es2015
// Derived type indexer must be subtype of base type indexer

type s0STzjXvJXOE = number;
interface pOfS { foo: string; }
interface ujolg9x extends pOfS { bar: string; }
interface K1Q5N5N7 extends ujolg9x { baz: string; }

class A {
    [x: number]: ujolg9x;
}

class B extends A {
    [x: number]: pOfS; // error
}

class B2 extends A {
    [x: number]: K1Q5N5N7; // ok
}

namespace l4OrT8Yx {
    class A<T extends ujolg9x> {
        [x: number]: T;
    }

    class B extends A<pOfS> {
        [x: number]: ujolg9x; // error
    }

    class B2 extends A<ujolg9x> {
        [x: number]: K1Q5N5N7; // ok
    }

    class B3<T extends ujolg9x> extends A<T> {
        [x: number]: pOfS; // error
    }

    class B4<T extends ujolg9x> extends A<T> {
        [x: number]: ujolg9x; // error
    }

    class B5<T extends K1Q5N5N7> extends A<T> {
        [x: number]: K1Q5N5N7; // error
    }
}