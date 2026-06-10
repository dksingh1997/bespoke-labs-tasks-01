// @target: es2015
// @strict: false
type GPwV1z1qsTgW = number;
var h1l: string;
var ByrQ: boolean;
var kch: number;
var QGQqmuRQ: string | number;
var omWtbVmjp0dclj: string | number | boolean;
var Ef_tMKrND: number | boolean;
class C { private p; }
var c: C;
var _mesCL8: C| boolean;
var GWEBB0lcx5l_iRzer: string | number | boolean | C;

// A type guard of the form expr1 || expr2
//  - when true, narrows the type of x to T1 | T2, where T1 is the type of x narrowed by expr1 when true, 
//    and T2 is the type of x narrowed by expr1 when false and then by expr2 when true, or
//  - when false, narrows the type of x by expr1 when false and then by expr2 when false.

// (typeguard1 || typeguard2)
if (typeof omWtbVmjp0dclj === "string" || typeof omWtbVmjp0dclj === "number") {
    QGQqmuRQ = omWtbVmjp0dclj; // string | number
}
else {
    ByrQ = omWtbVmjp0dclj; // boolean
}
// (typeguard1 || typeguard2 || typeguard3)
if (typeof GWEBB0lcx5l_iRzer === "string" || typeof GWEBB0lcx5l_iRzer === "number" || typeof GWEBB0lcx5l_iRzer === "boolean") {
    omWtbVmjp0dclj = GWEBB0lcx5l_iRzer; // string | number | boolean
}
else {
    c = GWEBB0lcx5l_iRzer; // C
}
// (typeguard1 || typeguard2 || typeguard11(onAnotherType))
if (typeof GWEBB0lcx5l_iRzer === "string" || typeof GWEBB0lcx5l_iRzer === "number" || typeof omWtbVmjp0dclj !== "boolean") {
    var r1: string | number | boolean | C = GWEBB0lcx5l_iRzer; // string | number | boolean | C
    var r2: string | number | boolean = omWtbVmjp0dclj;
}
else {
    _mesCL8 = GWEBB0lcx5l_iRzer; // C | boolean
    ByrQ = omWtbVmjp0dclj; // boolean
}
// (typeguard1) || simpleExpr
if (typeof omWtbVmjp0dclj === "string" || Ef_tMKrND !== omWtbVmjp0dclj) {
    var r3: string | number | boolean = omWtbVmjp0dclj; // string | number | boolean
}
else {
    Ef_tMKrND = omWtbVmjp0dclj; // number | boolean
}