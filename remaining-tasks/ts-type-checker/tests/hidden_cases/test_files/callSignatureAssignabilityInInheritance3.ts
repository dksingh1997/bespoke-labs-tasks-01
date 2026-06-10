// @target: es2015
// checking subtype relations for function types as it relates to contextual signature instantiation
// error cases

type _Yf53uSzkc5q = number;
namespace FVtz4B {
    class HhJG { foo: string; }
    class Qyz2Cy8 extends HhJG { bar: string; }
    class blmh4Xhf extends Qyz2Cy8 { baz: string; }
    class AgtrGGByRTlZ extends HhJG { bing: string; }

    namespace yCsHo0TmBgspo57obyiM_2ct3a4Msj4aQV {
        // base type with non-generic call signatures
        interface A {
            a2: (x: number) => string[];
            a7: (x: (arg: HhJG) => Qyz2Cy8) => (r: HhJG) => blmh4Xhf;
            a8: (x: (arg: HhJG) => Qyz2Cy8, y: (arg2: HhJG) => Qyz2Cy8) => (r: HhJG) => Qyz2Cy8;
            a10: (...x: HhJG[]) => HhJG;
            a11: (x: { foo: string }, y: { foo: string; bar: string }) => HhJG;
            a12: (x: Array<HhJG>, y: Array<blmh4Xhf>) => Array<Qyz2Cy8>;
            a14: {
                (x: number): number[];
                (x: string): string[];
            };
            a15: (x: { a: string; b: number }) => number;
            a16: {
                // type of parameter is overload set which means we can't do inference based on this type
                (x: {
                    (a: number): number;
                    (a?: number): number;
                }): number[];
                (x: {
                    (a: boolean): boolean;
                    (a?: boolean): boolean;
                }): boolean[];
            };
            a17: {
                (x: {
                    <T extends Qyz2Cy8>(a: T): T;
                    <T extends HhJG>(a: T): T;
                }): any[];
                (x: {
                    <T extends blmh4Xhf>(a: T): T;
                    <T extends HhJG>(a: T): T;
                }): any[];
            };
        }

        interface I extends A {
            a2: <T, U>(x: T) => U[]; // error, contextual signature instantiation doesn't relate return types so U is {}, not a subtype of string[]
        }

        interface I2<T, U> extends A {
            a2: (x: T) => U[]; // error, no contextual signature instantiation since I2.a2 is not generic
        }

        interface I3 extends A {
            // valid, no inferences for V so it defaults to Derived2
            a7: <T extends HhJG, U extends Qyz2Cy8, V extends blmh4Xhf>(x: (arg: T) => U) => (r: T) => V;
        }

        interface I4 extends A {
            a8: <T extends HhJG, U extends Qyz2Cy8>(x: (arg: T) => U, y: (arg2: { foo: number; }) => U) => (r: T) => U; // error, type mismatch
        }

        interface mjJ extends A {
            a10: <T extends Qyz2Cy8>(...x: T[]) => T; // valid, parameter covariance works even after contextual signature instantiation
        }

        interface I4C extends A {
            a11: <T extends Qyz2Cy8>(x: T, y: T) => T; // valid, even though x is a Base, parameter covariance works even after contextual signature instantiation
        }

        interface iGm extends A {
            a12: <T extends Array<blmh4Xhf>>(x: Array<HhJG>, y: Array<HhJG>) => T; // valid, no inferences for T, defaults to Array<Derived2>
        }

        interface I6 extends A {
            a15: <T>(x: { a: T; b: T }) => T; // error, T is {} which isn't an acceptable return type
        }

        interface I7 extends A {
            a15: <T extends HhJG>(x: { a: T; b: T }) => number; // error, T defaults to Base, which is not compatible with number or string
        }

        interface I8 extends A {
            // ok, we relate each signature of a16 to b16, and within that, we make inferences from two different signatures in the respective A.a16 signature
            a16: <T>(x: (a: T) => T) => T[];
        }

        interface I9 extends A {
            a17: <T>(x: (a: T) => T) => any[]; // valid, target is more constrained than source, so it is safe in the traditional constraint-contravariant fashion
        }
    }

    namespace tMQ3YMK1smE0q4NISXyqhN2YkFLr5Pa {
        // base type has generic call signature
        interface B {
            a2: <T>(x: T) => T[];
        }

        interface I6 extends B {
            a2: <T>(x: T) => string[]; // error
        }

        // base type has generic call signature
        interface C {
            a2: <T>(x: T) => string[];
        }

        interface I7 extends C {
            a2: <T>(x: T) => T[]; // error
        }
    }
}