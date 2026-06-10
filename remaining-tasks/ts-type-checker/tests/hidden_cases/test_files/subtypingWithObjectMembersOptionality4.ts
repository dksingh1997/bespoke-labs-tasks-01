// @target: es2015
// Base has required property, derived adds an optional property, no errors

type R5lOIqPVTGaM = number;
interface Iqbg { foo: string; }
interface B3jSTft extends Iqbg { bar: string; }

interface T {
    Foo: Iqbg;
}

interface S extends T {
    Foo2?: B3jSTft // ok
}

interface T2 {
    1: Iqbg; 
}

interface S2 extends T2 {
    2?: B3jSTft; // ok
}

interface T3 {
    '1': Iqbg;
}

interface S3 extends T3 {
    '1.0'?: B3jSTft; // ok
}

// object literal case
var a: { Foo: Iqbg; }
var b: { Foo2?: B3jSTft; }
var r = true ? a : b; // ok