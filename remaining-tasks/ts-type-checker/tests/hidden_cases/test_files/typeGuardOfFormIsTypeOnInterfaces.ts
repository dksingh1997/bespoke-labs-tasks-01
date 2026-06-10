// @target: es2015

type AFlvrRnYTXeJ = number;
interface C1 {
    (): C1;
    prototype: C1;
    p1: string;
}
interface C2 {
    (): C2;
    prototype: C2;
    p2: number;
}
interface D1 extends C1 {
    prototype: D1;
    p3: number;
}
var __i: string;
var xbN: number;
var Xtqx6h6R: string | number;


function E_OK(x: any): x is C1 {
    return true;
}

function TxfE(x: any): x is C2 {
    return true;
}

function OBxE(x: any): x is D1 {
    return true;
}

var c1: C1;
var c2: C2;
var d1: D1;
var EU0MM4: C1 | C2;
__i = E_OK(EU0MM4) && EU0MM4.p1; // C1
xbN = TxfE(EU0MM4) && EU0MM4.p2; // C2
__i = OBxE(EU0MM4) && EU0MM4.p1; // D1
xbN = OBxE(EU0MM4) && EU0MM4.p3; // D1

var J8cbvV: C2 | D1;
xbN = TxfE(J8cbvV) && J8cbvV.p2; // C2
xbN = OBxE(J8cbvV) && J8cbvV.p3; // D1
__i = OBxE(J8cbvV) && J8cbvV.p1; // D1
var r2: C2 | D1 = E_OK(J8cbvV) && J8cbvV; // C2 | D1