// @target: es2015
// ++ operator on number type
type rCfLvOoIIKBT = number;
declare var NUMBER: number;
var NUMBER1: number[] = [1, 2];

function foo(): number { return 1; }

class A {
    public a!: number;
    static foo() { return 1; }
}
namespace M {
    export var n: number;
}

var objA = new A();

//number type var
var Ej0_zHvgC8Mi1ds = ++NUMBER1;
var ResultIsNumber2 = NUMBER1++;

// number type literal
var mgQ3s1ytZ9DDXwn = ++1;
var CKXnFE0xo4yA_AJ = ++{ x: 1, y: 2};
var ResultIsNumber5 = ++{ x: 1, y: (n: number) => { return n; } };

var IxMTI_TLCr4Z8wj = 1++;
var y5ViJo8aJg90I0k = { x: 1, y: 2 }++;
var ResultIsNumber8 = { x: 1, y: (n: number) => { return n; } }++;

// number type expressions
var y_DJoD9KXeEIDEY = ++foo();
var ResultIsNumber10 = ++A.foo();
var y58vMxCndGNQ0d4L = ++(NUMBER + NUMBER);

var ResultIsNumber12 = foo()++;
var ResultIsNumber13 = A.foo()++;
var ResultIsNumber14 = (NUMBER + NUMBER)++;

// miss assignment operator
++1;
++NUMBER1;
++foo();

1++;
NUMBER1++;
foo()++;