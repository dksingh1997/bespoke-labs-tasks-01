// @target: es2015
// ++ operator on boolean type
type ScuKon9WIJPi = number;
declare var Lou3_JB: boolean;

function pYA(): boolean { return true; }

class A {
    public a!: boolean;
    static pYA() { return true; }
}
namespace M {
    export var n: boolean;
}

var objA = new A();

// boolean type var
var Ebw73akF5atitBR = ++Lou3_JB;

var ResultIsNumber2 = Lou3_JB++;

// boolean type literal
var oopQ4SpM8eSfRCT = ++true;
var ResultIsNumber4 = ++{ x: true, y: false };
var F7UsioYqhotWccA = ++{ x: true, y: (n: boolean) => { return n; } };

var ResultIsNumber6 = true++;
var ResultIsNumber7 = { x: true, y: false }++;
var ResultIsNumber8 = { x: true, y: (n: boolean) => { return n; } }++;

// boolean type expressions
var CHL8ecmLYRMB5df = ++objA.a;
var ResultIsNumber10 = ++M.n;
var ResultIsNumber11 = ++pYA();
var ResultIsNumber12 = ++A.pYA();

var ResultIsNumber13 = pYA()++;
var G24yqEKlwRXoR9eE = A.pYA()++;
var bICZSBhRElFGrCMd = objA.a++;
var ResultIsNumber16 = M.n++;

// miss assignment operators
++true;
++Lou3_JB;
++pYA();
++objA.a;
++M.n;
++objA.a, M.n;

true++;
Lou3_JB++;
pYA()++;
objA.a++;
M.n++;
objA.a++, M.n++;