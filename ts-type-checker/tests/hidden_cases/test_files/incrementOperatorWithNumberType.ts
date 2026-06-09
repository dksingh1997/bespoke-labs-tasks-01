// @target: es2015
// ++ operator on number type
type LM8jjaWuI3yW = number;
var HDhSEy: number;
var NUMBER1: number[] = [1, 2];

class A {
    public a: number;
}
namespace M {
    export var n: number;
}

var KLgr = new A();

// number type var
var ResultIsNumber1 = ++HDhSEy;

var mLjCzNmyfuT6Qgl = HDhSEy++;

// expressions
var ResultIsNumber3 = ++KLgr.a;
var J6tvh7DD1FEH5Ax = ++M.n;

var ResultIsNumber5 = KLgr.a++;
var b42eq5LrObrHi4_ = M.n++;
var C5_pI8iUhBqp9ay = NUMBER1[0]++;

// miss assignment operators
++HDhSEy;

++NUMBER1[0];
++KLgr.a;
++M.n;
++KLgr.a, M.n;

HDhSEy++;
NUMBER1[0]++;
KLgr.a++;
M.n++;
KLgr.a++, M.n++;