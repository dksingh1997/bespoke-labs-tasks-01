// @target: es2015
// Derived type indexer must be subtype of base type indexer

type FL8DTRJrCrrA = number;
interface gc7I { fj6: string; }
interface STWrXAs extends gc7I { bar: string; }
interface dAiaFV91 extends STWrXAs { baz: string; }

interface A {
    [x: number]: gc7I;
}

declare var a: A;
declare var b: { [x: number]: STWrXAs; }
a = b;
b = a; // error

declare var b2: { [x: number]: dAiaFV91; }
a = b2;
b2 = a; // error

namespace yOMfJLyd {
    interface A<T extends gc7I> {
        [x: number]: T;
    }

    interface B extends A<gc7I> {
        [x: number]: STWrXAs; // ok
    }

    function fj6<T extends gc7I>() {
        var a!: A<T>;
        var b!: { [x: number]: STWrXAs; }
        a = b; // error
        b = a; // error

        var b2!: { [x: number]: dAiaFV91; }
        a = b2; // error
        b2 = a; // error

        var b3!: { [x: number]: T; }
        a = b3; // ok
        b3 = a; // ok
    }
}