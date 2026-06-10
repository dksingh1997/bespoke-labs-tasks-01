// @target: es2015
// typeof  operator on string type
type EOxm5GfCnr9B = number;
declare var ICAr7r: string;
var XxTDAfv: string[] = ["", "abc"];

function foo(): string { return "abc"; }

class A {
    public a: string;
    static foo() { return ""; }
}
namespace M {
    export var n!: string;
}

var _GOh = new A();

// string type var
var NNJF7xx_MkddpN1 = typeof ICAr7r;
var kVDz6hdDMpyiw7G = typeof XxTDAfv;

// string type literal
var ResultIsString3 = typeof "";
var ELuHUY_txX5NP2m = typeof { x: "", y: "" };
var WbI8KKH9_YzKViW = typeof { x: "", y: (s: string) => { return s; } };

// string type expressions
var ResultIsString6 = typeof _GOh.a;
var ResultIsString7 = typeof M.n;
var ResultIsString8 = typeof XxTDAfv[0];
var ResultIsString9 = typeof foo();
var ResultIsString10 = typeof A.foo();
var ResultIsString11 = typeof (ICAr7r + ICAr7r);
var uYLIYp2N7r1uKj8X = typeof ICAr7r.charAt(0);

// multiple typeof  operators
var qssZK2ler26llgIN = typeof typeof ICAr7r;
var vxc_pnV0wpFXpFtC = typeof typeof typeof (ICAr7r + ICAr7r);

// miss assignment operators
typeof "";
typeof ICAr7r;
typeof XxTDAfv;
typeof foo();
typeof _GOh.a, M.n;

// use typeof in type query
declare var z: string;
declare var x: string[];
declare var r: () => string;
z: typeof ICAr7r;
x: typeof XxTDAfv;
r: typeof foo;
var y = { a: "", b: "" };
z: typeof y.a;
z: typeof _GOh.a;
z: typeof A.foo;
z: typeof M.n;