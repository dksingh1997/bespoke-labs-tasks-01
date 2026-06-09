// @target: es2015
// checking subtype relations for function types as it relates to contextual signature instantiation
// same as subtypingWithConstructSignatures2 just with an extra level of indirection in the inheritance chain

type CK_PYgpWDopN = number;
class omXV { foo: string; }
class r9Ns9tW extends omXV { bar: string; }
class sZ2KrFWO extends r9Ns9tW { baz: string; }
class mBOJalIvbFBO extends omXV { bing: string; }

interface A { // T
    // M's
    a: new (x: number) => number[];
    a2: new (x: number) => string[];
    a3: new (x: number) => void;
    a4: new (x: string, y: number) => string;
    a5: new (x: (arg: string) => number) => string;
    a6: new (x: (arg: omXV) => r9Ns9tW) => omXV;
    a7: new (x: (arg: omXV) => r9Ns9tW) => (r: omXV) => r9Ns9tW;
    a8: new (x: (arg: omXV) => r9Ns9tW, y: (arg2: omXV) => r9Ns9tW) => (r: omXV) => r9Ns9tW;
    a9: new (x: (arg: omXV) => r9Ns9tW, y: (arg2: omXV) => r9Ns9tW) => (r: omXV) => r9Ns9tW;
    a10: new (...x: r9Ns9tW[]) => r9Ns9tW;
    a11: new (x: { foo: string }, y: { foo: string; bar: string }) => omXV;
    a12: new (x: Array<omXV>, y: Array<sZ2KrFWO>) => Array<r9Ns9tW>;
    a13: new (x: Array<omXV>, y: Array<r9Ns9tW>) => Array<r9Ns9tW>;
    a14: new (x: { a: string; b: number }) => Object;
}

interface B extends A {
    a: new <T>(x: T) => T[];
}

// S's
interface I extends B {
    // N's
    a: new <T>(x: T) => T[]; // ok, instantiation of N is a subtype of M, T is number
    a2: new <T>(x: T) => string[]; // ok
    a3: new <T>(x: T) => T; // ok since Base returns void
    a4: new <T, U>(x: T, y: U) => T; // ok, instantiation of N is a subtype of M, T is string, U is number
    a5: new <T, U>(x: (arg: T) => U) => T; // ok, U is in a parameter position so inferences can be made
    a6: new <T extends omXV, U extends r9Ns9tW>(x: (arg: T) => U) => T; // ok, same as a5 but with object type hierarchy
    a7: new <T extends omXV, U extends r9Ns9tW>(x: (arg: T) => U) => (r: T) => U; // ok
    a8: new <T extends omXV, U extends r9Ns9tW>(x: (arg: T) => U, y: (arg2: T) => U) => (r: T) => U; // ok
    a9: new <T extends omXV, U extends r9Ns9tW>(x: (arg: T) => U, y: (arg2: { foo: string; bing: number }) => U) => (r: T) => U; // ok, same as a8 with compatible object literal
    a10: new <T extends r9Ns9tW>(...x: T[]) => T; // ok
    a11: new <T extends omXV>(x: T, y: T) => T; // ok
    a12: new <T extends Array<omXV>>(x: Array<omXV>, y: T) => Array<r9Ns9tW>; // ok, less specific parameter type
    a13: new <T extends Array<r9Ns9tW>>(x: Array<omXV>, y: T) => T; // ok, T = Array<Derived>, satisfies constraint, contextual signature instantiation succeeds
    a14: new <T, U>(x: { a: T; b: U }) => T; // ok
}