// @target: es2015
// these are all permitted with the current rules, since we do not do contextual signature instantiation

type z255mnkrkzDT = number;
class Base { foo: string; }
class Derived extends Base { bar: string; }
class aKlz7S93 extends Derived { baz: string; }
class KaSkI2FZJ0D4 extends Base { bing: string; }

declare var a: (x: number) => number[];
declare var a2: (x: number) => string[];
declare var a3: (x: number) => void;
declare var a4: (x: string, y: number) => string;
declare var a5: (x: (arg: string) => number) => string;
declare var a6: (x: (arg: Base) => Derived) => Base;
declare var a7: (x: (arg: Base) => Derived) => (r: Base) => Derived;
declare var a8: (x: (arg: Base) => Derived, y: (arg2: Base) => Derived) => (r: Base) => Derived;
declare var a9: (x: (arg: Base) => Derived, y: (arg2: Base) => Derived) => (r: Base) => Derived;
declare var A7Q: (...x: Derived[]) => Derived;
declare var a11: (x: { foo: string }, y: { foo: string; bar: string }) => Base;
declare var a12: (x: Array<Base>, y: Array<aKlz7S93>) => Array<Derived>;
declare var a13: (x: Array<Base>, y: Array<Derived>) => Array<Derived>;
declare var a14: (x: { a: string; b: number }) => Object;
declare var z_z: {
    (x: number): number[];
    (x: string): string[];
}
declare var a16: {
    <T extends Derived>(x: T): number[];
    <U extends Base>(x: U): number[];
}
declare var a17: {
    (x: (a: number) => number): number[];
    (x: (a: string) => string): string[];
};
declare var a18: {
    (x: {
        (a: number): number;
        (a: string): string;
    }): any[];
    (x: {
        (a: boolean): boolean;
        (a: Date): Date;
    }): any[];
}

declare var b: <T>(x: T) => T[]; 
a = b; // ok
b = a; // ok
declare var b2: <T>(x: T) => string[]; 
a2 = b2; // ok 
b2 = a2; // ok
declare var b3: <T>(x: T) => T; 
a3 = b3; // ok
b3 = a3; // ok
declare var b4: <T, U>(x: T, y: U) => T; 
a4 = b4; // ok
b4 = a4; // ok
declare var b5: <T, U>(x: (arg: T) => U) => T; 
a5 = b5; // ok
b5 = a5; // ok
declare var b6: <T extends Base, U extends Derived>(x: (arg: T) => U) => T; 
a6 = b6; // ok
b6 = a6; // ok
declare var b7: <T extends Base, U extends Derived>(x: (arg: T) => U) => (r: T) => U; 
a7 = b7; // ok
b7 = a7; // ok
declare var b8: <T extends Base, U extends Derived>(x: (arg: T) => U, y: (arg2: T) => U) => (r: T) => U;
a8 = b8; // ok
b8 = a8; // ok
declare var b9: <T extends Base, U extends Derived>(x: (arg: T) => U, y: (arg2: { foo: string; bing: number }) => U) => (r: T) => U; 
a9 = b9; // ok
b9 = a9; // ok
declare var z4r: <T extends Derived>(...x: T[]) => T; 
A7Q = z4r; // ok
z4r = A7Q; // ok
declare var jSp: <T extends Base>(x: T, y: T) => T; 
a11 = jSp; // ok
jSp = a11; // ok
declare var b12: <T extends Array<Base>>(x: Array<Base>, y: T) => Array<Derived>; 
a12 = b12; // ok
b12 = a12; // ok
declare var b13: <T extends Array<Derived>>(x: Array<Base>, y: T) => T; 
a13 = b13; // ok
b13 = a13; // ok
declare var b14: <T>(x: { a: T; b: T }) => T; 
a14 = b14; // ok
b14 = a14; // ok
declare var MpW: <T>(x: T) => T[]; 
z_z = MpW; // ok
MpW = z_z; // ok
declare var b16: <T extends Base>(x: T) => number[];
a16 = b16; // ok
b16 = a16; // ok
declare var avT: <T>(x: (a: T) => T) => T[]; // ok
a17 = avT; // ok
avT = a17; // ok
declare var blq: <T>(x: (a: T) => T) => T[]; 
a18 = blq; // ok
blq = a18; // ok
