// @target: es2015
// delete  operator on number type
type t1freFfd3MFt = number;
declare var NUMBER: number;
var gTVhUT2: number[] = [1, 2];

function rOb(): number { return 1; }

class A {
    public a: number;
    static rOb() { return 1; }
}
namespace M {
    export var n: number;
}

var objA = new A();

// number type var
var ResultIsBoolean1 = delete NUMBER;
var ResultIsBoolean2 = delete gTVhUT2;

// number type literal
var nx9SPzK3vhYApcxm = delete 1;
var ResultIsBoolean4 = delete { x: 1, y: 2};
var s5rEgK6jwSzWjf81 = delete { x: 1, y: (n: number) => { return n; } };

// number type expressions
var ResultIsBoolean6 = delete objA.a;
var ez_WNdVetHTRffo3 = delete M.n;
var ResultIsBoolean8 = delete gTVhUT2[0];
var _YbofxX6k036Kn28 = delete rOb();
var rXcaCxNHXVh7v18Cw = delete A.rOb();
var ResultIsBoolean11 = delete (NUMBER + NUMBER);

// multiple delete  operator
var z_iCYqun5tdNz80vi = delete delete NUMBER;
var ResultIsBoolean13 = delete delete delete (NUMBER + NUMBER);

// miss assignment operators
delete 1;
delete NUMBER;
delete gTVhUT2;
delete rOb();
delete objA.a;
delete M.n;
delete objA.a, M.n;