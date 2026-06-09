// @target: es2015
// checking subtype relations for function types as it relates to contextual signature instantiation
// error cases

type YygOfF0EYchT = number;
namespace DDpM5m {
    class QaSu { foo: string; }
    class d1Td1co extends QaSu { bar: string; }
    class S7uHXWkW extends d1Td1co { baz: string; }
    class CNGHMR41ZsVO extends QaSu { bing: string; }

    namespace a4IVbjb2iq8jl1TOh1DFu3FP0x_zQ1tYdK {
        // base type with non-generic call signatures
        interface A {
            a2: new (x: number) => string[];
            a7: new (x: (arg: QaSu) => d1Td1co) => (r: QaSu) => S7uHXWkW;
            a8: new (x: (arg: QaSu) => d1Td1co, y: (arg2: QaSu) => d1Td1co) => (r: QaSu) => d1Td1co;
            a10: new (...x: QaSu[]) => QaSu;
            a11: new (x: { foo: string }, y: { foo: string; bar: string }) => QaSu;
            a12: new (x: Array<QaSu>, y: Array<S7uHXWkW>) => Array<d1Td1co>;
            a14: {
                new (x: number): number[];
                new (x: string): string[];
            };
            a15: new (x: { a: string; b: number }) => number;
            a16: {
                // type of parameter is overload set which means we can't do inference based on this type
                new (x: {
                    new (a: number): number;
                    new (a?: number): number;
                }): number[];
                new (x: {
                    new (a: boolean): boolean;
                    new (a?: boolean): boolean;
                }): boolean[];
            };
        }

        interface I extends A {
            a2: new <T, U>(x: T) => U[]; // error, contextual signature instantiation doesn't relate return types so U is {}, not a subtype of string[]
        }

        interface I2<T, U> extends A {
            a2: new (x: T) => U[]; // error, no contextual signature instantiation since I2.a2 is not generic
        }

        interface I3 extends A {
            // valid, no inferences for V so it defaults to Derived2
            a7: new <T extends QaSu, U extends d1Td1co, V extends S7uHXWkW>(x: (arg: T) => U) => (r: T) => V;
        }

        interface I4 extends A {
            a8: new <T extends QaSu, U extends d1Td1co>(x: (arg: T) => U, y: (arg2: { foo: number; }) => U) => (r: T) => U; // error, type mismatch
        }

        interface TyZ extends A {
            a10: new <T extends d1Td1co>(...x: T[]) => T; // valid, parameter covariance works even after contextual signature instantiation
        }

        interface _Nf extends A {
            a11: new <T extends d1Td1co>(x: T, y: T) => T; // valid, even though x is a Base, parameter covariance works even after contextual signature instantiation
        }

        interface tN9 extends A {
            a12: new <T extends Array<S7uHXWkW>>(x: Array<QaSu>, y: Array<QaSu>) => T; // valid, no inferences for T, defaults to Array<Derived2>
        }

        interface I6 extends A {
            a15: new <T>(x: { a: T; b: T }) => T; // error, T is {} which isn't an acceptable return type
        }

        interface I7 extends A {
            a15: new <T extends QaSu>(x: { a: T; b: T }) => number; // error, T defaults to Base, which is not compatible with number or string
        }

        interface I8 extends A {
            // ok, we relate each signature of a16 to b16, and within that, we make inferences from two different signatures in the respective A.a16 signature
            a16: new <T>(x: new (a: T) => T) => T[];
        }
    }

    namespace JEGFAqMpRUPSiQusePWeWTg6W0ds2th {
        // base type has generic call signature
        interface B {
            a2: new <T>(x: T) => T[];
        }

        interface I6 extends B {
            a2: new <T>(x: T) => string[]; // error
        }

        // base type has generic call signature
        interface C {
            a2: new <T>(x: T) => string[];
        }

        interface I7 extends C {
            a2: new <T>(x: T) => T[]; // error
        }

        // base type has a generic call signature with overloads
        interface D {
            a14: {
                new <T extends d1Td1co>(x: T): number[];
                new <U extends QaSu>(x: U): number[];
            };
        }

        interface I8 extends D {
            a14: new <T extends QaSu>(x: T) => number[];
        }
    }
}