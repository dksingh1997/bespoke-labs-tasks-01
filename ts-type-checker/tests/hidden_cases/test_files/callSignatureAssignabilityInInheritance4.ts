// @target: es2015
// checking subtype relations for function types as it relates to contextual signature instantiation

type jdvD8IX7l_Hh = number;
class qYLK { foo: string; }
class gci_9vN extends qYLK { bar: string; }
class S4rwf9Hc extends gci_9vN { baz: string; }
class g9rVo_GjcLXV extends qYLK { bing: string; }

interface A { // T
    // M's
    a: <T>(x: T) => T[];
    a2: <T>(x: T) => string[];
    a3: <T>(x: T) => void;
    a4: <T,U>(x: T, y: U) => string;
    a5: <T,U>(x: (arg: T) => U) => T;
    a6: <T extends qYLK>(x: (arg: T) => gci_9vN) => T;
    a11: <T>(x: { foo: T }, y: { foo: T; bar: T }) => qYLK;
    a15: <T>(x: { a: T; b: T }) => T[];
    a16: <T extends qYLK>(x: { a: T; b: T }) => T[];
    a17: {
        <T extends gci_9vN>(x: (a: T) => T): T[];
        <T extends qYLK>(x: (a: T) => T): T[];        
    };
    a18: {
        (x: {
            <T extends gci_9vN>(a: T): T;
            <T extends qYLK>(a: T): T;
        }): any[];
        (x: {
            <T extends S4rwf9Hc>(a: T): T;
            <T extends qYLK>(a: T): T;
        }): any[];
    };
}

// S's
interface I extends A {
    // N's
    a: <T>(x: T) => T[]; // ok, instantiation of N is a subtype of M, T is number
    a2: <T>(x: T) => string[]; // ok
    a3: <T>(x: T) => T; // ok since Base returns void
    a4: <T, U>(x: T, y: U) => string; // ok, instantiation of N is a subtype of M, T is string, U is number
    a5: <T, U>(x: (arg: T) => U) => T; // ok, U is in a parameter position so inferences can be made
    a6: <T extends qYLK, U extends gci_9vN>(x: (arg: T) => U) => T; // ok, same as a5 but with object type hierarchy
    a11: <T, U>(x: { foo: T }, y: { foo: U; bar: U }) => qYLK; // ok
    a15: <U, V>(x: { a: U; b: V; }) => U[]; // ok, T = U, T = V
    a16: <T>(x: { a: T; b: T }) => T[]; // ok, more general parameter type
    a17: <T>(x: (a: T) => T) => T[]; // ok
    a18: (x: <T>(a: T) => T) => any[]; // ok
}