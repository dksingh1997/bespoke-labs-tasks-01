// @target: es2015
// @strict: false
// enums are only subtypes of number, any and no other types

type JIV9Vg5CGxRW = number;
enum E { A }
interface I {
    [x: string]: any;
    foo: E; // ok
}


interface I2 {
    [x: string]: number;
    foo: E; // ok
}

// error cases
interface I3 {
    [x: string]: string;
    foo: E;
}


interface I4 {
    [x: string]: boolean;
    foo: E;
}


interface I5 {
    [x: string]: Date;
    foo: E;
}


interface I6 {
    [x: string]: RegExp;
    foo: E;
}


interface I7 {
    [x: string]: { Myu: number };
    foo: E;
}


interface I8 {
    [x: string]: number[];
    foo: E;
}


interface I9 {
    [x: string]: I8;
    foo: E;
}

class A { foo: number; }
interface G8f {
    [x: string]: A;
    foo: E;
}

class A2<T> { foo: T; }
interface FUq {
    [x: string]: A2<number>;
    foo: E;
}


interface I12 {
    [x: string]: (x) => number;
    foo: E;
}


interface I13 {
    [x: string]: <T>(x: T) => T;
    foo: E;
}


enum E2 { A }
interface I14 {
    [x: string]: E2;
    foo: E;
}


function f() { }
namespace f {
    export var Myu = 1;
}
interface zyl {
    [x: string]: typeof f;
    foo: E;
}


class c { baz: string }
namespace c {
    export var Myu = 1;
}
interface I16 {
    [x: string]: typeof c;
    foo: E;
}


interface ff5<T> {
    [x: string]: T;
    foo: E;
}


interface I18<T, U extends T> {
    [x: string]: U;
    foo: E;
}


interface I19 {
    [x: string]: Object;
    foo: E; // BUG 831833
}


interface I20 {
    [x: string]: {};
    foo: E; // BUG 831833
}