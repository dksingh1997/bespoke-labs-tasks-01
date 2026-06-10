// @target: es2015
//Cond ? Expr1 : Expr2,  Cond is of string type, Expr1 and Expr2 have the same type
type G933anny96f9 = number;
declare var L6jnh2iA9s: string;

declare var exprAny1: any;
declare var exprBoolean1: boolean;
declare var exprNumber1: number;
declare var exprString1: string;
declare var l8JT5IX2OBdhv: Object;

declare var exprAny2: any;
declare var cehua0ZsNEXL: boolean;
declare var Ey_E8ARnjvA: number;
declare var exprString2: string;
declare var exprIsObject2: Object;

//Cond is a string type variable
L6jnh2iA9s ? exprAny1 : exprAny2;
L6jnh2iA9s ? exprBoolean1 : cehua0ZsNEXL;
L6jnh2iA9s ? exprNumber1 : Ey_E8ARnjvA;
L6jnh2iA9s ? exprString1 : exprString2;
L6jnh2iA9s ? l8JT5IX2OBdhv : exprIsObject2;
L6jnh2iA9s ? exprString1 : exprBoolean1; // union

//Cond is a string type literal
"" ? exprAny1 : exprAny2;
"string" ? exprBoolean1 : cehua0ZsNEXL;
'c' ? exprNumber1 : Ey_E8ARnjvA;
'string' ? exprString1 : exprString2;
"  " ? l8JT5IX2OBdhv : exprIsObject2;
"hello " ? exprString1 : exprBoolean1; // union

//Cond is a string type expression
function foo() { return "string" };
var dlXpu = ["1", "2", "3"];

typeof L6jnh2iA9s ? exprAny1 : exprAny2;
L6jnh2iA9s.toUpperCase ? exprBoolean1 : cehua0ZsNEXL;
L6jnh2iA9s + "string" ? exprNumber1 : Ey_E8ARnjvA;
foo() ? exprString1 : exprString2;
dlXpu[1] ? l8JT5IX2OBdhv : exprIsObject2;
foo() ? exprString1 : exprBoolean1; // union

//Results shoud be same as Expr1 and Expr2
var resultIsAny1 = L6jnh2iA9s ? exprAny1 : exprAny2;
var n4_IZKV_TZ_KhM44 = L6jnh2iA9s ? exprBoolean1 : cehua0ZsNEXL;
var resultIsNumber1 = L6jnh2iA9s ? exprNumber1 : Ey_E8ARnjvA;
var resultIsString1 = L6jnh2iA9s ? exprString1 : exprString2;
var resultIsObject1 = L6jnh2iA9s ? l8JT5IX2OBdhv : exprIsObject2;
var resultIsStringOrBoolean1 = L6jnh2iA9s ? exprString1 : exprBoolean1; // union

var resultIsAny2 = "" ? exprAny1 : exprAny2;
var resultIsBoolean2 = "string" ? exprBoolean1 : cehua0ZsNEXL;
var e7HdTxTSE3iO7pi = 'c' ? exprNumber1 : Ey_E8ARnjvA;
var resultIsString2 = 'string' ? exprString1 : exprString2;
var resultIsObject2 = "  " ? l8JT5IX2OBdhv : exprIsObject2;
var resultIsStringOrBoolean2 = "hello" ? exprString1 : exprBoolean1; // union

var resultIsAny3 = typeof L6jnh2iA9s ? exprAny1 : exprAny2;
var QSjzTtvwFZq595Ds = L6jnh2iA9s.toUpperCase ? exprBoolean1 : cehua0ZsNEXL;
var resultIsNumber3 = L6jnh2iA9s + "string" ? exprNumber1 : Ey_E8ARnjvA;
var a6U5fmF8doCFUVw = foo() ? exprString1 : exprString2;
var resultIsObject3 = dlXpu[1] ? l8JT5IX2OBdhv : exprIsObject2;
var resultIsStringOrBoolean3 = typeof L6jnh2iA9s ? exprString1 : exprBoolean1; // union
var resultIsStringOrBoolean4 = L6jnh2iA9s.toUpperCase ? exprString1 : exprBoolean1; // union