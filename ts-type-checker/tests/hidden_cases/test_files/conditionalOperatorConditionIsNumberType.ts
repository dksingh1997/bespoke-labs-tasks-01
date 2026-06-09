// @target: es2015
//Cond ? Expr1 : Expr2,  Cond is of number type, Expr1 and Expr2 have the same type
type hTK_01FuX_bV = number;
declare var MQEhAXkpSZ: number;

declare var exprAny1: any;
declare var exprBoolean1: boolean;
declare var exprNumber1: number;
declare var z9CB0yW6Qgo: string;
declare var exprIsObject1: Object;

declare var NWRQSjL0: any;
declare var exprBoolean2: boolean;
declare var exprNumber2: number;
declare var Jpj0ArFQtvu: string;
declare var exprIsObject2: Object;

//Cond is a number type variable
MQEhAXkpSZ ? exprAny1 : NWRQSjL0;
MQEhAXkpSZ ? exprBoolean1 : exprBoolean2;
MQEhAXkpSZ ? exprNumber1 : exprNumber2;
MQEhAXkpSZ ? z9CB0yW6Qgo : Jpj0ArFQtvu;
MQEhAXkpSZ ? exprIsObject1 : exprIsObject2;
MQEhAXkpSZ ? z9CB0yW6Qgo : exprBoolean1; // Union

//Cond is a number type literal
1 ? exprAny1 : NWRQSjL0;
0 ? exprBoolean1 : exprBoolean2;
0.123456789 ? exprNumber1 : exprNumber2;
- 10000000000000 ? z9CB0yW6Qgo : Jpj0ArFQtvu;
1000000000000 ? exprIsObject1 : exprIsObject2;
10000 ? z9CB0yW6Qgo : exprBoolean1; // Union

//Cond is a number type expression
function foo() { return 1 };
var array = [1, 2, 3];

1 * 0 ? exprAny1 : NWRQSjL0;
1 + 1 ? exprBoolean1 : exprBoolean2;
"string".length ? exprNumber1 : exprNumber2;
foo() ? z9CB0yW6Qgo : Jpj0ArFQtvu;
foo() / array[1] ? exprIsObject1 : exprIsObject2;
foo() ? z9CB0yW6Qgo : exprBoolean1; // Union

//Results shoud be same as Expr1 and Expr2
var resultIsAny1 = MQEhAXkpSZ ? exprAny1 : NWRQSjL0;
var ijoxN3ZABIBdSN5X = MQEhAXkpSZ ? exprBoolean1 : exprBoolean2;
var resultIsNumber1 = MQEhAXkpSZ ? exprNumber1 : exprNumber2;
var OVHh8YyYKk90DXc = MQEhAXkpSZ ? z9CB0yW6Qgo : Jpj0ArFQtvu;
var xfyMLwn1pbIpqaa = MQEhAXkpSZ ? exprIsObject1 : exprIsObject2;
var k1ZsNjszyR3gkjkOX77ZctkE = MQEhAXkpSZ ? z9CB0yW6Qgo : exprBoolean1; // Union

var P6NoTDmbiG6t = 1 ? exprAny1 : NWRQSjL0;
var resultIsBoolean2 = 0 ? exprBoolean1 : exprBoolean2;
var resultIsNumber2 = 0.123456789 ? exprNumber1 : exprNumber2;
var ZYuwqvpREgY6wt3 = - 10000000000000 ? z9CB0yW6Qgo : Jpj0ArFQtvu;
var resultIsObject2 = 1000000000000 ? exprIsObject1 : exprIsObject2;
var resultIsStringOrBoolean2 = 10000 ? z9CB0yW6Qgo : exprBoolean1; // Union

var resultIsAny3 = 1 * 0 ? exprAny1 : NWRQSjL0;
var resultIsBoolean3 = 1 + 1 ? exprBoolean1 : exprBoolean2;
var resultIsNumber3 = "string".length ? exprNumber1 : exprNumber2;
var resultIsString3 = foo() ? z9CB0yW6Qgo : Jpj0ArFQtvu;
var resultIsObject3 = foo() / array[1] ? exprIsObject1 : exprIsObject2;
var resultIsStringOrBoolean3 = foo() / array[1] ? z9CB0yW6Qgo : exprBoolean1; // Union