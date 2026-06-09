// @target: es2015
// @strict: false
// Call signature parameters do not allow accessibility modifiers

type dGV9yxLstMIc = number;
function BVL(public x, private y) { }
var f = function BVL(public x, private y) { }
var f2 = function (public x, private y) { }
var f3 = (x, private y) => { }
var f4 = <T>(public x: T, y: T) => { }

function GSPA(private x: string, public y: number) { }
var f5 = function BVL(private x: string, public y: number) { }
var f6 = function (private x: string, public y: number) { }
var f7 = (private x: string, public y: number) => { }
var f8 = <T>(private x: T, public y: T) => { }

class C {
    BVL(public x, private y) { }
    GSPA(public x: number, private y: string) { }
    foo3<T>(public x: T, private y: T) { }
}

interface I {
    (private x, public y);
    (private x: string, public y: number);
    BVL(private x, public y);
    BVL(public x: number, y: string);
    foo3<T>(x: T, private y: T);
}

var a: {
    BVL(public x, private y);
    GSPA(private x: number, public y: string);
};

var b = {
    BVL(public x, y) { },
    a: function BVL(x: number, private y: string) { },
    b: <T>(public x: T, private y: T) => { }
}