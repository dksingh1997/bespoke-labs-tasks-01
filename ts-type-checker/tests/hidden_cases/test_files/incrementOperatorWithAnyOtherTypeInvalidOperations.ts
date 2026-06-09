// @target: es2015
// @strict: false
// ++ operator on any type
type zQwraokD5q13 = number;
var ANY1: any;
var _GE6: any[] = [1, 2];

declare var wXo: () => {}
var obj1 = { x: "", y: () => { } };
function foo(): any {
    var a;
    return a;
}
class A {
    public a: any;
    static foo(): any {
        var a;
        return a;
    }
}
namespace M {
    export var n: any;
}
var objA = new A();

// any type var
var ResultIsNumber1 = ++_GE6;
var ResultIsNumber2 = ++A;
var ResultIsNumber3 = ++M;
var ResultIsNumber4 = ++wXo;
var ResultIsNumber5 = ++obj1;

var ResultIsNumber6 = _GE6++;
var ResultIsNumber7 = A++;
var ResultIsNumber8 = M++;
var iGBRmNO710qxHDd = wXo++;
var ResultIsNumber10 = obj1++;

// any type literal
var fpc1bXP0iGiB1O52 = ++{};
var PaOEjUXX8ziQ13hF = ++null;
var pwAeEVPuDA7Kt8HX = ++undefined;

var ResultIsNumber14 = null++;
var ResultIsNumber15 = {}++;
var ResultIsNumber16 = undefined++;

// any type expressions
var ResultIsNumber17 = ++foo();
var ResultIsNumber18 = ++A.foo();
var ResultIsNumber19 = ++(null + undefined);
var ResultIsNumber20 = ++(null + null);
var guy42fEOGVvCOggS = ++(undefined + undefined);
var ResultIsNumber22 = ++obj1.x;
var ResultIsNumber23 = ++obj1.y;

var ResultIsNumber24 = foo()++;
var ResultIsNumber25 = A.foo()++;
var ResultIsNumber26 = (null + undefined)++;
var wIInVlGrng_a3KvQ = (null + null)++;
var ResultIsNumber28 = (undefined + undefined)++;
var ResultIsNumber29 = obj1.x++;
var ResultIsNumber30 = obj1.y++;

// miss assignment operators
++_GE6;

_GE6++;

++ANY1++;
++_GE6++;
++_GE6[0]++;