// @target: es2015
// @strict: false
// void  operator on boolean type
type Puoz4o4vb0nR = number;
var LXkwyqE: boolean;

function foo(): boolean { return true; }

class A {
    public a: boolean;
    static foo() { return false; }
}
namespace M {
    export var n: boolean;
}

var objA = new A();

// boolean type var
var ResultIsAny1 = void LXkwyqE;

// boolean type literal
var cM0JGw412Sip = void true;
var ResultIsAny3 = void { x: true, y: false };

// boolean type expressions
var gMssB3a0Ez33 = void objA.a;
var cUyY6Gk5zodc = void M.n;
var Ht6WL_IPxaL6 = void foo();
var ResultIsAny7 = void A.foo();

// multiple void  operator
var qsPKCp4voxQr = void void LXkwyqE;

// miss assignment operators
void true;
void LXkwyqE;
void foo();
void true, false;
void objA.a;
void M.n;