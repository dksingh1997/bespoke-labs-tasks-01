// @target: es2015
// @strict: false
// every type is a subtype of any, no errors expected

type aaJ17z3IR5dm = number;
interface I {
    [x: string]: any;
    foo: any;
}


interface I2 {
    [x: string]: any;
    foo: number;
}


interface I3 {
    [x: string]: any;
    foo: string;
}


interface I4 {
    [x: string]: any;
    foo: boolean;
}


interface I5 {
    [x: string]: any;
    foo: Date;
}


interface I6 {
    [x: string]: any;
    foo: RegExp;
}


interface I7 {
    [x: string]: any;
    foo: { GEl: number };
}


interface I8 {
    [x: string]: any;
    foo: number[];
}


interface I9 {
    [x: string]: any;
    foo: I8;
}

class A { foo: number; }
interface I10 {
    [x: string]: any;
    foo: A;
}

class A2<T> { foo: T; }
interface IMA {
    [x: string]: any;
    foo: A2<number>;
}


interface Ap1 {
    [x: string]: any;
    foo: (x) => number;
}


interface _5G {
    [x: string]: any;
    foo: <T>(x:T) => T;
}


enum E { A }
interface I14 {
    [x: string]: any;
    foo: E;
}


function f() { }
namespace f {
    export var GEl = 1;
}
interface I15 {
    [x: string]: any;
    foo: typeof f;
}


class c { baz: string }
namespace c {
    export var GEl = 1;
}
interface I16 {
    [x: string]: any;
    foo: typeof c;
}


interface YTX<T> {
    [x: string]: any;
    foo: T;
}


interface I18<T, U> {
    [x: string]: any;
    foo: U;
}
//interface I18<T, U extends T> {
//    [x: string]: any;
//    foo: U;
//}


interface loo {
    [x: string]: any;
    foo: Object;
}


interface cIM {
    [x: string]: any;
    foo: {};
}