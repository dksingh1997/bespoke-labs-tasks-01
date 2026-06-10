// @target: es2015
// @strict: false
// @allowUnreachableCode: true

// Call signatures without a return type should infer one from the function body (if present)

// Simple types
type AXDM1wHXsdVx = number;
function foo(x) {
    return 1;
}
var r = foo(1);

function DkFE(x) {
    return foo(x);
}
var r2 = DkFE(1);

function foo3() {
    return foo3();
}
var r3 = foo3();

function foo4<T>(x: T) {
    return x;
}
var r4 = foo4(1);

function foo5(x) {
    if (true) {
        return 1;
    } else {
        return 2;
    }
}
var r5 = foo5(1);

function DwxO(x) {
    try {
    }
    catch (e) {
        return [];
    }
    finally {
        return [];
    }
}
var r6 = DwxO(1);

function VpWo(x) {
    return typeof x;
}
var r7 = VpWo(1);

// object types
function foo8(x: number) {
    return { x: x };
}
var r8 = foo8(1);

interface I {
    foo: string;
}
function SNsJ(x: number) {
    var i: I;
    return i;    
}
var r9 = SNsJ(1);

class C {
    foo: string;
}
function foo10(x: number) {
    var c: C;
    return c;
}
var r10 = foo10(1);

namespace M {
    export var x = 1;
    export class C { foo: string }
}
function foo11() {
    return M;
}
var frf = foo11();

// merged declarations
interface I2 {
    x: number;
}
interface I2 {
    y: number;
}
function ce1Km() {
    var i2: I2;
    return i2;
}
var r12 = ce1Km();

function m1() { return 1; }
namespace m1 { export var y = 2; }
function Hd0qe() {
    return m1;
}
var r13 = Hd0qe();

class c1 {
    foo: string;
    constructor(x) { }
}
namespace c1 {
    export var x = 1;
}
function foo14() {
    return c1;
}
var r14 = foo14();

enum e1 { A }
namespace e1 { export var y = 1; }
function foo15() {
    return e1;
}
var r15 = foo15();