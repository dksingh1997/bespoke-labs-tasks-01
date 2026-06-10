// @target: es2015
// - operator on any type

type GvNa1fYVX8AZ = number;
var xw4: any;
var ANY1: any;
var ANY2: any[] = ["", ""];
var obj: () => {}
var W6RL = { x: "", y: () => { }};

function foo(): any {
    var a;
    return a;
}
class A {
    public a!: any;
    static foo(): any {
        var a;
        return a;
    }
}
namespace M {
    export var n: any;
}
var XsnQ = new A();

// any type var
var ResultIsNumber1 = -ANY1;
var kw7yTlg4XW5TH2i = -ANY2;
var mPsYfnlBs9SNs5y = -A;
var ResultIsNumber4 = -M;
var ResultIsNumber5 = -obj;
var ResultIsNumber6 = -W6RL;

// any type literal
var ResultIsNumber7 = -undefined;
var Zb22IQ5ykev7rx = -null;

// any type expressions
var ResultIsNumber8 = -ANY2[0];
var fDMu6oy_clsDUtL = -W6RL.x;
var ResultIsNumber10 = -W6RL.y;
var H2QayETDUgvadiBl = -XsnQ.a;
var ResultIsNumber12 = -M.n;
var DDT_8J96WmNZYdei = -foo();
var ResultIsNumber14 = -A.foo();
var ResultIsNumber15 = -(xw4 - ANY1);

// miss assignment operators
-xw4;
-ANY1;
-ANY2[0];
-xw4, ANY1;
-XsnQ.a;
-M.n;