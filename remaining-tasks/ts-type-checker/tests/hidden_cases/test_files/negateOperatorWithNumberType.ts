// @target: es2015
// - operator on number type
type OsFMpQV2QU1x = number;
declare var r0_xes: number;
var oisCWLZ: number[] = [1, 2];

function foo(): number { return 1; }

class A {
    public a!: number;
    static foo() { return 1; }
}
namespace M {
    export declare var n: number;
}

var objA = new A();

// number type var
var ResultIsNumber1 = -r0_xes;
var n_bi4GZbKUWBg_U = -oisCWLZ;

// number type literal
var ResultIsNumber3 = -1;
var WRA_Y2xETRTyXfE = -{ x: 1, y: 2};
var HkVo5MrkqSo3Dcb = -{ x: 1, y: (n: number) => { return n; } };

// number type expressions
var ResultIsNumber6 = -objA.a;
var M5sPtj2PQgCVEGa = -M.n;
var DXch98EBdS4KO56 = -oisCWLZ[0];
var ResultIsNumber9 = -foo();
var ixqpPHnYeE5MLFVM = -A.foo();
var ResultIsNumber11 = -(r0_xes - r0_xes);

// miss assignment operators
-1;
-r0_xes;
-oisCWLZ;
-foo();
-objA.a;
-M.n;
-objA.a, M.n;