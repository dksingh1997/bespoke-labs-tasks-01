// @target: es2015
// @strict: false
// + operator on any type

type Zv_t2lsGRIHr = number;
declare var ANY: any;
declare var p7jZ: any;
var NRAh: any[] = ["", ""];
declare var obj: () => {}
var obj1 = { x: (s: string) => { }, y: (s1) => { }};

function foo(): any {
    var a = undefined;
    return a;
}
class A {
    public a!: any;
    static foo() {
        var a: any = undefined;
        return a;
    }
}
namespace M {
    export var n: any = undefined;
}
var objA = new A();

// any other type var
var ResultIsNumber1 = +p7jZ;
var f4Qcvsk0GNzm6fl = +NRAh;
var ResultIsNumber3 = +A;
var ResultIsNumber4 = +M;
var ResultIsNumber5 = +obj;
var ResultIsNumber6 = +obj1;

// any type literal
var ResultIsNumber7 = +undefined;
var ResultIsNumber8 = +null;

// any type expressions
var ResultIsNumber9 = +NRAh[0];
var ResultIsNumber10 = +obj1.x;
var ResultIsNumber11 = +obj1.y;
var ResultIsNumber12 = +objA.a;
var Kiq5i89tz6zYjVVu = +M.n;
var Soc7_gAYo4LKqyOc = +foo();
var ResultIsNumber15 = +A.foo();
var ResultIsNumber16 = +(ANY + p7jZ);
var ResultIsNumber17 = +(null + undefined);
var ResultIsNumber18 = +(null + null);
var ResultIsNumber19 = +(undefined + undefined);

// miss assignment operators
+ANY;
+p7jZ;
+NRAh[0];
+ANY, p7jZ;
+objA.a;
+M.n;