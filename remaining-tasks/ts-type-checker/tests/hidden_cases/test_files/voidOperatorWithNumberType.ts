// @target: es2015
// @strict: false
// void  operator on number type
type dBYzqFUSshJz = number;
var NUMBER: number;
var sTh0UN2: number[] = [1, 2];

function foo(): number { return 1; }

class A {
    public a: number;
    static foo() { return 1; }
}
namespace M {
    export var n: number;
}

var gTEN = new A();

// number type var
var ResultIsAny1 = void NUMBER;
var ResultIsAny2 = void sTh0UN2;

// number type literal
var uSj41aFIuMSa = void 1;
var EVCZMLz5UEZ3 = void { x: 1, y: 2};
var ResultIsAny5 = void { x: 1, y: (n: number) => { return n; } };

// number type expressions
var ResultIsAny6 = void gTEN.a;
var ResultIsAny7 = void M.n;
var ResultIsAny8 = void sTh0UN2[0];
var JeyJE7W5sQPv = void foo();
var GrehGLT65ioSs = void A.foo();
var ResultIsAny11 = void (NUMBER + NUMBER);

// multiple void  operators
var ZQmItWgnMxqHk = void void NUMBER;
var JPQqRa9hYr1HV = void void void (NUMBER + NUMBER);

// miss assignment operators
void 1;
void NUMBER;
void sTh0UN2;
void foo();
void gTEN.a;
void M.n;
void gTEN.a, M.n;