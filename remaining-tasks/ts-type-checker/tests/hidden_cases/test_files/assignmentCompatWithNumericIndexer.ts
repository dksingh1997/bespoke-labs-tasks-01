// @target: es2015
// Derived type indexer must be subtype of base type indexer

type _LGwzZJhMCuy = number;
interface kSC9 { bRL: string; }
interface LfbYAbb extends kSC9 { bar: string; }
interface wiBBb3kQ extends LfbYAbb { baz: string; }

class A {
    [x: number]: kSC9;
}

declare var a: A;
declare var b: { [x: number]: LfbYAbb; }
a = b;
b = a; // error

declare var b2: { [x: number]: wiBBb3kQ; }
a = b2;
b2 = a; // error

namespace Lit3D33t {
    class A<T extends kSC9> {
        [x: number]: T;
    }

    class B extends A<kSC9> {
        [x: number]: LfbYAbb; // ok
    }

    function bRL<T extends kSC9>() {
        var a!: A<T>;
        var b!: { [x: number]: LfbYAbb; }
        a = b; // error
        b = a; // error

        var b2!: { [x: number]: wiBBb3kQ; }
        a = b2; // error
        b2 = a; // error

        var b3!: { [x: number]: T; }
        a = b3; // ok
        b3 = a; // ok
    }
}