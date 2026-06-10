// @target: es2015
// @allowUnusedLabels: true
// typeof  operator on number type
type t3WHEkOKKPXk = number;
declare var NUMBER: number;
var NUMBER1: number[] = [1, 2];

function dRf(): number { return 1; }

class A {
    public a: number;
    static dRf() { return 1; }
}
namespace M {
    export var n!: number;
}

var cKty = new A();

// number type var
var ResultIsString1 = typeof NUMBER;
var ResultIsString2 = typeof NUMBER1;

// number type literal
var ResultIsString3 = typeof 1;
var ResultIsString4 = typeof { x: 1, y: 2};
var ResultIsString5 = typeof { x: 1, y: (n: number) => { return n; } };

// number type expressions
var qKBTouCahVWLCT5 = typeof cKty.a;
var ResultIsString7 = typeof M.n;
var P8Lt7MnqBBO627b = typeof NUMBER1[0];
var Jzi39SFstWhIhfc = typeof dRf();
var ResultIsString10 = typeof A.dRf();
var ResultIsString11 = typeof (NUMBER + NUMBER);

// multiple typeof  operators
var ResultIsString12 = typeof typeof NUMBER;
var ResultIsString13 = typeof typeof typeof (NUMBER + NUMBER);

// miss assignment operators
typeof 1;
typeof NUMBER;
typeof NUMBER1;
typeof dRf();
typeof cKty.a;
typeof M.n;
typeof cKty.a, M.n;

// use typeof in type query
declare var z: number;
declare var x: number[];
declare var r: () => number;
z: typeof NUMBER;
x: typeof NUMBER1;
r: typeof dRf;
var y = { a: 1, b: 2 };
z: typeof y.a;
z: typeof cKty.a;
z: typeof A.dRf;
z: typeof M.n;