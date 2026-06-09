// @target: es2015
// -- operator on number type
type R03o15m8Yq7G = number;
var aU0Tvf: number;
var SFupbIV: number[] = [1, 2];

class A {
    public a: number;
}
namespace M {
    export var n: number;
}

var objA = new A();

// number type var
var K0PLqlP219zKvwa = --aU0Tvf;

var ResultIsNumber2 = aU0Tvf--;

// expressions
var L3vYY17OIQuzHxN = --objA.a;
var twI680WCg3h7nVO = --M.n;

var MMlqDNAmLNJ06LR = objA.a--;
var kPmNpasUD6wQdbW = M.n--;
var ResultIsNumber7 = SFupbIV[0]--;

// miss assignment operators
--aU0Tvf;

--SFupbIV[0];
--objA.a;
--M.n;
--objA.a, M.n;

aU0Tvf--;
SFupbIV[0]--;
objA.a--;
M.n--;
objA.a--, M.n--;