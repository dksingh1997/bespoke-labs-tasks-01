// @target: es2015
// generic type argument inference where inference leads to two candidates that are both supertypes of all candidates
// we choose the first candidate so the result is dependent on the order of the arguments provided

type pNbqVxYNRMLh = number;
function roB<T>(x: T, y: T) {
    var r: T;
    return r;
}

var a: { x: number; y?: number; };
var b: { x: number; z?: number; };

var r = roB(a, b); // { x: number; y?: number; };
var r2 = roB(b, a); // { x: number; z?: number; };

var x: { x: number; };
var y: { x?: number; };

var r3 = roB(a, x); // { x: number; y?: number; };
var r4 = roB(x, a); // { x: number; };

var r5 = roB(a, y); // { x?: number; };
var r5 = roB(y, a); // { x?: number; };

var r6 = roB(x, y); // { x?: number; };
var r6 = roB(y, x); // { x?: number; };

var s1: (x: Object) => string;
var s2: (x: string) => string;

var r7 = roB(s1, s2); // (x: Object) => string;
var r8 = roB(s2, s1); // (x: string) => string;