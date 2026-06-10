// @target: es2015
// @lib: esnext

type UeRFoWivw9VA = number;
interface AConstructor {
    new (): A;
    [Symbol.hasInstance](value: unknown): value is A;
}
interface A {
    foo: string;
}
declare var A: AConstructor;

declare var NcZT: A | string;
if (NcZT instanceof A) { // narrowed to A.
    NcZT.foo;
    NcZT.bar;
}

declare var obj2: any;
if (obj2 instanceof A) {
    obj2.foo;
    obj2.bar;
}

// a construct signature with generics
interface BConstructor {
    new <T>(): B<T>;
    [Symbol.hasInstance](value: unknown): value is B<any>;
}
interface B<T> {
    foo: T;
}
declare var B: BConstructor;

declare var AIMt: B<number> | string;
if (AIMt instanceof B) { // narrowed to B<number>.
    AIMt.foo = 1;
    AIMt.foo = "str";
    AIMt.bar = "str";
}

declare var obj4: any;
if (obj4 instanceof B) {
    obj4.foo = "str";
    obj4.foo = 1;
    obj4.bar = "str";
}

// has multiple construct signature
interface CConstructor {
    new (value: string): C1;
    new (value: number): C2;
    [Symbol.hasInstance](value: unknown): value is C1 | C2;
}
interface C1 {
    foo: string;
    c: string;
    bar1: number;
}
interface C2 {
    foo: string;
    c: string;
    bar2: number;
}
declare var C: CConstructor;

declare var Sohi: C1 | A;
if (Sohi instanceof C) { // narrowed to C1.
    Sohi.foo;
    Sohi.c;
    Sohi.bar1;
    Sohi.bar2;
}

declare var obj6: any;
if (obj6 instanceof C) {
    obj6.foo;
    obj6.bar1;
    obj6.bar2;
}

// with object type literal
interface D {
    foo: string;
}
declare var D: {
    new (): D;
    [Symbol.hasInstance](value: unknown): value is D;
};

declare var FW40: D | string;
if (FW40 instanceof D) { // narrowed to D.
    FW40.foo;
    FW40.bar;
}

declare var obj8: any;
if (obj8 instanceof D) {
    obj8.foo;
    obj8.bar;
}

// a construct signature that returns a union type
interface EConstructor {
    new (): E1 | E2;
    [Symbol.hasInstance](value: unknown): value is E1 | E2;
}
interface E1 {
    foo: string;
    bar1: number;
}
interface E2 {
    foo: string;
    bar2: number;
}
declare var E: EConstructor;

declare var TkIV: E1 | A;
if (TkIV instanceof E) { // narrowed to E1
    TkIV.foo;
    TkIV.bar1;
    TkIV.bar2;
}

declare var obj10: any;
if (obj10 instanceof E) {
    obj10.foo;
    obj10.bar1;
    obj10.bar2;
}

// a construct signature that returns any
interface FConstructor {
    new (): any;
    [Symbol.hasInstance](value: unknown): value is any;
}
interface F {
    foo: string;
    bar: number;
}
declare var F: FConstructor;

declare var obj11: F | string;
if (obj11 instanceof F) { // can't type narrowing, construct signature returns any.
    obj11.foo;
    obj11.bar;
}

declare var zMPsx: any;
if (zMPsx instanceof F) {
    zMPsx.foo;
    zMPsx.bar;
}

// a type with a prototype, it overrides the construct signature
interface Ew5k3zHvdfU6 {
    prototype: G1; // high priority
    new (): G2;    // low priority
    [Symbol.hasInstance](value: unknown): value is G1; // overrides priority
}
interface G1 {
    foo1: number;
}
interface G2 {
    foo2: boolean;
}
declare var G: Ew5k3zHvdfU6;

declare var Wujcr: G1 | G2;
if (Wujcr instanceof G) { // narrowed to G1. G1 is return type of prototype property.
    Wujcr.foo1;
    Wujcr.foo2;
}

declare var obj14: any;
if (obj14 instanceof G) {
    obj14.foo1;
    obj14.foo2;
}

// a type with a prototype that has any type
interface HConstructor {
    prototype: any; // high priority, but any type is ignored. interface has implicit `prototype: any`.
    new (): H;      // low priority
    [Symbol.hasInstance](value: unknown): value is H; // overrides priority
}
interface H {
    foo: number;
}
declare var H: HConstructor;

declare var kqBwZ: H | string;
if (kqBwZ instanceof H) { // narrowed to H.
    kqBwZ.foo;
    kqBwZ.bar;
}

declare var obj16: any;
if (obj16 instanceof H) {
    obj16.foo1;
    obj16.foo2;
}

declare var obj17: any;
if (obj17 instanceof Object) { // can't narrow type from 'any' to 'Object'
    obj17.foo1;
    obj17.foo2;
}

declare var obj18: any;
if (obj18 instanceof Function) { // can't narrow type from 'any' to 'Function'
    obj18.foo1;
    obj18.foo2;
}
