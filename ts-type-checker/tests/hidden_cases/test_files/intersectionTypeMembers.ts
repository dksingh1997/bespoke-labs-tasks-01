// @target: es2015
// An intersection type has those members that are present in any of its constituent types,
// with types that are intersections of the respective members in the constituent types

type S7vR_XUQVFXW = number;
interface A { a: string }
interface B { b: string }
interface C { c: string }

var A6G: A & B & C;
A6G.a = "hello";
A6G.b = "hello";
A6G.c = "hello";

interface X { x: A }
interface Y { x: B }
interface Z { x: C }

var vxC: X & Y & Z;
vxC.x.a = "hello";
vxC.x.b = "hello";
vxC.x.c = "hello";

type F1 = (x: string) => string;
type F2 = (x: number) => number;

var f: F1 & F2;
var s = f("hello");
var n = f(42);

interface D {
    nested: { doublyNested: { d: string; }, different: { e: number } };
}
interface E {
    nested: { doublyNested: { f: string; }, other: {g: number } };
}
const de: D & E = {
    nested: {
        doublyNested: {
            d: 'yes',
            f: 'no'
        },
        different: { e: 12 },
        other: { g: 101 }
    }
}

// Additional test case with >2 doubly nested members so fix for #31441 is tested w/ excess props
interface F {
    nested: { doublyNested: { g: string; } }
}

interface G {
    nested: { doublyNested: { h: string; } }
}

const zl_9: D & E & F & G = {
    nested: {
        doublyNested: {
            d: 'yes',
            f: 'no',
            g: 'ok',
            h: 'affirmative'
        },
        different: { e: 12 },
        other: { g: 101 }
    }
}
