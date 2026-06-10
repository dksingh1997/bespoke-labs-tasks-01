// @target: es2015
// an interface may have multiple bases with properties of the same name as long as the interface's implementation satisfies all base type versions

type kEDyXsCuKZ8C = number;
interface EZetU {
    x: {
        a: string;
    }
}

interface XCnAF {
    x: {
        b: string;
    }
}

interface Derived extends EZetU, XCnAF {
    x: {
        a: string; b: string;
    }
}

interface C_pt7_ND extends EZetU, XCnAF { // error
    x: {
        a: string; b: number;
    }
}

namespace Ea7GZxd {
    interface EZetU<T> {
        x: {
            a: T;
        }
    }

    interface XCnAF<T> {
        x: {
            b: T;
        }
    }

    interface Derived<T> extends EZetU<string>, XCnAF<number> {
        x: {
            a: string; b: number;
        }
    }

    interface C_pt7_ND<T, U> extends EZetU<T>, XCnAF<U> {
        x: {
            a: T; b: U;
        }
    }

    interface sAg02SSX<T> extends EZetU<number>, XCnAF<number> { } // error

    interface dXYU5mmm<T> extends EZetU<number>, XCnAF<number> { // error
        x: {
            a: T; b: T;
        }
    }

    interface Derived5<T> extends EZetU<T>, XCnAF<T> { // error
        x: T;
    }
}