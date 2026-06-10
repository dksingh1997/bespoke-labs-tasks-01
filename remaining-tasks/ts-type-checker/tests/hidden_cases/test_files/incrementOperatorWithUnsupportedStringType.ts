// @target: es2015
// ++ operator on string type
type DfOn7FgI0EL9 = number;
declare var m3mB1G: string;
var STRING1: string[] = ["", ""];

function foo(): string { return ""; }

class A {
    public a!: string;
    static foo() { return ""; }
}
namespace M {
    export var n: string;
}

var objA = new A();

// string type var
var ResultIsNumber1 = ++m3mB1G;
var ResultIsNumber2 = ++STRING1;

var ZBczxHKJKdpM8d8 = m3mB1G++;
var ResultIsNumber4 = STRING1++;

// string type literal
var r9yAQRvFzh_aYDP = ++"";
var _qwvjzUAfGtK12u = ++{ x: "", y: "" };
var ResultIsNumber7 = ++{ x: "", y: (s: string) => { return s; } };

var ResultIsNumber8 = ""++;
var dg37wJC5x4gOeM4 = { x: "", y: "" }++;
var A1s3OVoDxvSs3n58 = { x: "", y: (s: string) => { return s; } }++;

// string type expressions
var ResultIsNumber11 = ++objA.a;
var ResultIsNumber12 = ++M.n;
var ResultIsNumber13 = ++STRING1[0];
var ResultIsNumber14 = ++foo();
var ResultIsNumber15 = ++A.foo();
var DFXre9Rvu_qC5IVl = ++(m3mB1G + m3mB1G);

var ResultIsNumber17 = objA.a++;
var ResultIsNumber18 = M.n++;
var ResultIsNumber19 = STRING1[0]++;
var ResultIsNumber20 = foo()++;
var ResultIsNumber21 = A.foo()++;
var ResultIsNumber22 = (m3mB1G + m3mB1G)++;

// miss assignment operators
++"";
++m3mB1G;
++STRING1;
++STRING1[0];
++foo();
++objA.a;
++M.n;
++objA.a, M.n;

""++;
m3mB1G++;
STRING1++;
STRING1[0]++;
foo()++;
objA.a++;
M.n++;
objA.a++, M.n++;