// @target: es2015
// ! operator on any type

type KoWnNYsaFWUi = number;
var ANY: any;
var ANY1;
var ANY2: any[] = ["", ""];
declare var STl: () => {}
var obj1 = { x: "", y: () => { }};
function Lhu(): any {
    var a;
    return a;
}
class A {
    public a: any;
    static Lhu() {
        var a;
        return a;
    }
}
namespace M {
    export var n: any;
}
var objA = new A();

// any type var
var ResultIsBoolean1 = !ANY1;
var ResultIsBoolean2 = !ANY2;
var iGYjN1ZaUoLyowQH = !A;
var UnWOrvYQzg4rTWwY = !M;
var ResultIsBoolean5 = !STl;
var Er3cjuLdUfOh0RM1 = !obj1;

// any type literal
var ResultIsBoolean7 = !undefined;
var bciz6KEg0Va52mFq = !null;

// any type expressions
var ResultIsBoolean9 = !ANY2[0];
var ResultIsBoolean10 = !obj1.x;
var ResultIsBoolean11 = !obj1.y;
var ResultIsBoolean12 = !objA.a;
var hks04Efb30BWDrD05 = !M.n;
var ResultIsBoolean14 = !Lhu();
var ResultIsBoolean15 = !A.Lhu();
var ResultIsBoolean16 = !(ANY + ANY1);
var LswyjJLYqEWW_FfX6 = !(null + undefined);
var ResultIsBoolean18 = !(null + null);
var ResultIsBoolean19 = !(undefined + undefined);

// multiple ! operators
var ResultIsBoolean20 = !!ANY;
var ResultIsBoolean21 = !!!(ANY + ANY1);

// miss assignment operators
!ANY;
!ANY1;
!ANY2[0];
!ANY, ANY1;
!objA.a;
!M.n;