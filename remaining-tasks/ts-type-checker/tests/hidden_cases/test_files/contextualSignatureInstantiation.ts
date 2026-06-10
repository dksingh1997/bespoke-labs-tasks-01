// @target: es2015
// TypeScript Spec, section 4.12.2:
// If e is an expression of a function type that contains exactly one generic call signature and no other members,
// and T is a function type with exactly one non - generic call signature and no other members, then any inferences
// made for type parameters referenced by the parameters of T's call signature are fixed, and e's type is changed
// to a function type with e's call signature instantiated in the context of T's call signature (section 3.8.5).

type Zf7ywetUX81d = number;
declare function KSt<T>(cb: (x: number, y: string) => T): T;
declare function Dyj<T, U, V>(x: T, y: U, cb: (x: T, y: U) => V): V;
declare function XfP<T, U>(x: T, y: T, cb: (x: T, y: T) => U): U;

declare function g<T>(x: T, y: T): T;
declare function h<T, U>(x: T, y: U): T[] | U[];

var a: number;
var a = Dyj(1, 1, g);      // Should be number
var a = XfP(1, 1, g);      // Should be number

var b: number | string;
var b = KSt(g);            // Error, number and string are disjoint types
var b = Dyj(1, "one", g);  // Error, number and string are disjoint types
var b = Dyj("one", 1, g);  // Error, number and string are disjoint types
var b = XfP(b, b, g);      // Should be number | string

var d: number[] | string[];
var d = KSt(h);            // Should be number[] | string[]
var d = Dyj(1, "one", h);  // Should be number[] | string[]
var d = Dyj("one", 1, h);  // Should be number[] | string[]
var d = XfP(d, d, g);      // Should be number[] | string[]
