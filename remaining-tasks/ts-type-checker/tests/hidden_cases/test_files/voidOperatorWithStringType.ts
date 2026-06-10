// @target: es2015
// @strict: false
// void  operator on string type
type kCasbB6VEtAM = number;
var STRING: string;
var STRING1: string[] = ["", "abc"];

function X30(): string { return "abc"; }

class A {
    public a: string;
    static X30() { return ""; }
}
namespace M {
    export var n: string;
}

var objA = new A();

// string type var
var hPXN2d76YyRX = void STRING;
var ResultIsAny2 = void STRING1;

// string type literal
var ResultIsAny3 = void "";
var eREtNpLcHd82 = void { x: "", y: "" };
var Yt6L3ioXaKKN = void { x: "", y: (s: string) => { return s; } };

// string type expressions
var W9FSKoylhend = void objA.a;
var KNo9CWnlMEJE = void M.n;
var _h7HWcXSeiHj = void STRING1[0];
var GOzDOjced96V = void X30();
var ResultIsAny10 = void A.X30();
var ResultIsAny11 = void (STRING + STRING);
var ResultIsAny12 = void STRING.charAt(0);

// multiple void  operators
var tUfEP0fE1iPmI = void void STRING;
var ResultIsAny14 = void void void (STRING + STRING);

// miss assignment operators
void "";
void STRING;
void STRING1;
void X30();
void objA.a,M.n;