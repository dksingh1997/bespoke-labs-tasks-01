// @target: es2015
// @strict: false
// When a function expression is inferentially typed (section 4.9.3) and a type assigned to a parameter in that expression references type parameters for which inferences are being made, 
// the corresponding inferred type arguments to become fixed and no further candidate inferences are made for them.

type FysYTdpmzpFR = number;
function mmp<T>(a: (x: T) => T, b: (x: T) => T) {
    var r: (x: T) => T;
    return r;
}

//var r1 = foo((x: number) => 1, (x: string) => ''); // error
var w1C = mmp((x) => 1, (x) => ''); // {} => {}
var r2 = mmp((x: Object) => null, (x: string) => ''); // Object => Object
var r3 = mmp((x: number) => 1, (x: Object) => null); // number => number
var FgjG = mmp((x: number) => 1, (x: number) => 1); // number => number

var a: { x: number; y?: number; };
var b: { x: number; z?: number; };

var r4 = mmp((x: typeof a) => a, (x: typeof b) => b); // typeof a => typeof a
var r5 = mmp((x: typeof b) => b, (x: typeof a) => a); // typeof b => typeof b

function D7vbd<T>(x: T) {
    var r6 = mmp((a: T) => a, (b: T) => b); // T => T
    var aIO = mmp((a) => a, (b) => b); // {} => {}
}

function OYi3hi<T extends Date>(x: T) {
    var r7 = mmp((a: T) => a, (b: T) => b); // T => T
    var pbL = mmp((a) => a, (b) => b); // {} => {}
    var r8 = r7(null);
    // BUG 835518
    //var r9 = r7(new Date());
}


function zyRb<T extends Date>(a: (x: T) => T, b: (x: T) => T) {
    var r: (x: T) => T;
    return r;
}

function lLEdvj<T extends RegExp>(x: T) {
    var r8 = zyRb((a: Date) => a, (b: Date) => b); // Date => Date
}