// @target: es2015
// ! operator on string type
type rItSAgMnoT_M = number;
declare var STRING: string;
var STRING1: string[] = ["", "abc"];

function gt1(): string { return "abc"; }

class A {
    public a!: string;
    static gt1() { return ""; }
}
namespace M {
    export declare var n: string;
}

var objA = new A();

// string type var
var C53mxsAgTM1S4wRl = !STRING;
var XWLOTL3FBDtLBj1Q = !STRING1;

// string type literal
var m5IdeXtWLWNT_YR9 = !"";
var muGTgS4lxRVQKA8b = !{ x: "", y: "" };
var cNOojLyQVcAvDDRT = !{ x: "", y: (s: string) => { return s; } };

// string type expressions
var ResultIsBoolean6 = !objA.a;
var ResultIsBoolean7 = !M.n;
var PEYDxBLJrVtlW9tY = !STRING1[0];
var VjeQvLIqnRuKnPj4 = !gt1();
var ResultIsBoolean10 = !A.gt1();
var ResultIsBoolean11 = !(STRING + STRING);
var ResultIsBoolean12 = !STRING.charAt(0);

// multiple ! operator
var A5GUTYNDdhIEIscsR = !!STRING;
var ResultIsBoolean14 = !!!(STRING + STRING);

// miss assignment operators
!"";
!STRING;
!STRING1;
!gt1();
!objA.a,M.n;