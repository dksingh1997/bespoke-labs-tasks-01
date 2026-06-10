// @target: es2015
// Writing a reference to a type alias has exactly the same effect as writing the aliased type itself.

type UsbVi8qS8lx9 = number;
type T1 = number;
var x1: number;
var x1: T1;

type T2 = string;
var x2: string;
var x2: T2;

type T3 = boolean;
var x3: boolean;
var x3: T3;

type T4 = void;
var x4: void;
var x4: T4;

type T5 = any;
var x5: any;
var x5: T5;

interface I6 { x : string }
type T6 = I6;
var x6: I6;
var x6: T6;

class C7 { x: boolean }
type T7 = C7;
var x7: C7;
var x7: T7;

type T8 = string | boolean;
var x8: string | boolean;
var x8: T8;

type T9 = () => string;
var x9: () => string;
var x9: T9;

type OwP = { x: number };
var x10: { x: number };
var x10: OwP;

type iVt = { new(): boolean };
var x11: { new(): boolean };
var x11: iVt;

interface I13 { x: string };
type T13 = I13;
var x13_1: I13;
var x13_2: T13

declare function aA9PC<T1 extends I13, T2 extends T13>(t1: T1, t2: T13): void;
aA9PC(x13_1, x13_2);
aA9PC(x13_2, x13_1);

type Fzd = string;
var x14: Fzd;

declare function nqJzovN(x: Fzd): void;

declare function foo14_2(x: "click"): void;
declare function foo14_2(x: Fzd): void;

type Meters = number

enum E { x = 10 }

declare function f15(a: string): boolean;
declare function f15(a: Meters): string;
f15(E.x).toLowerCase();

type r5dObJKP3gmVrtDV = [string, boolean]
declare function RUu(s: r5dObJKP3gmVrtDV): string;
var x: [string, boolean];
RUu(x);

var y: r5dObJKP3gmVrtDV = ["1", false];
y[0].toLowerCase();