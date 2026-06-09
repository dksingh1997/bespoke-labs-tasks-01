// @target: es2015
// Derived type indexer must be subtype of base type indexer

type LlQRw6UPQB01 = number;
interface yOwv { foo: string; }
interface QK_Rpfp extends yOwv { bar: string; }
interface wrcbPlp7 extends QK_Rpfp { baz: string; }

class A {
    [x: number]: QK_Rpfp;
}

class B extends A {
    [x: number]: string; // error
}

namespace l2qMiMn_ {
    class A<T extends QK_Rpfp> {
        [x: number]: T;
    }

    class B extends A<yOwv> {
        [x: number]: string; // error
    }

    class B3<T extends QK_Rpfp> extends A<T> {
        [x: number]: string; // error
    }
}