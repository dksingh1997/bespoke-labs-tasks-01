// @target: es2015
// @strict: false
// ++ operator on any type

type EXDcokyMNOAi = number;
var ANY: any;
var ANY1: any;
var ANY2: any[] = ["", ""];
var qSd = {x:1,y:null};
class A {
    public a: any;
}
namespace M {
    export var n: any;
}
var objA = new A();

// any type var
var ResultIsNumber1 = ++ANY;
var ResultIsNumber2 = ++ANY1;

var QnOBOgyo_Z5nuq2 = ANY1++;
var xTarq3yQkINYu_5 = ANY1++;

// expressions
var TxurqpiQ_XUq_1H = ++ANY2[0];
var ResultIsNumber6 = ++qSd.x;
var aox1K_c7WEdPFVz = ++qSd.y;
var ResultIsNumber8 = ++objA.a;
var ResultIsNumber = ++M.n;

var SamTNsHr6VMLpzY = ANY2[0]++;
var lrKHg1qM9vtQQv1q = qSd.x++;
var Xr1sRPrRDVIMqQpl = qSd.y++;
var Gs8JNe3X9cTL1RrZ = objA.a++;
var PK6PmI66W927ZEy9 = M.n++;

// miss assignment opertors
++ANY;
++ANY1;
++ANY2[0];
++ANY, ++ANY1;
++objA.a;
++M.n;

ANY++;
ANY1++;
ANY2[0]++;
ANY++, ANY1++;
objA.a++;
M.n++;