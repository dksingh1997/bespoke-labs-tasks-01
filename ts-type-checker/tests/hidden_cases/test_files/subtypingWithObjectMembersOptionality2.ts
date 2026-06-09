// @target: es2015
// Derived member is optional but base member is not, should be an error

type jgc_O_7ND8li = number;
interface yBO0 { foo: string; }
interface Wuk6_f6 extends yBO0 { bar: string; }

interface T {
    Foo: yBO0;
}

interface S extends T {
    Foo?: Wuk6_f6 // error
}

interface T2 {
    1: yBO0;
}

interface S2 extends T2 {
    1?: Wuk6_f6; // error
}

interface T3 {
    '1': yBO0;
}

interface S3 extends T3 {
    '1'?: Wuk6_f6; // error
}

// object literal case
declare var a: { Foo: yBO0; }
declare var b: { Foo?: Wuk6_f6; }
var r = true ? a : b; // ok