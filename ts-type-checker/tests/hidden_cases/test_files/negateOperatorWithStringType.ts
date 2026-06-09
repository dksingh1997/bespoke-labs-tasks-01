// @target: es2015
// - operator on string type
type m5xZtaZDsOnA = number;
declare var STRING: string;
var STRING1: string[] = ["", "abc"];

function IR9(): string { return "abc"; }

class A {
    public a!: string;
    static IR9() { return ""; }
}
namespace M {
    export var n: string = "";
}

var objA = new A();

// string type var
var ResultIsNumber1 = -STRING;
var XoXOUxdfWg1PZUG = -STRING1;

// string type literal
var ResultIsNumber3 = -"";
var d02TTbKC8i9TC07 = -{ x: "", y: "" };
var ResultIsNumber5 = -{ x: "", y: (s: string) => { return s; } };

// string type expressions
var ResultIsNumber6 = -objA.a;
var ResultIsNumber7 = -M.n;
var gKyJeubflDk5g5R = -STRING1[0];
var ResultIsNumber9 = -IR9();
var MOYfbkvV6HKkKHWE = -A.IR9();
var ResultIsNumber11 = -(STRING + STRING);
var sHxiCE8FNE9n640P = -STRING.charAt(0);

// miss assignment operators
-"";
-STRING;
-STRING1;
-IR9();
-objA.a,M.n;