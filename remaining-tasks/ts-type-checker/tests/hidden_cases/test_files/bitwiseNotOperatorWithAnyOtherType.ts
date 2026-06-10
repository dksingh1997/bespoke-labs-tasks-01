// @target: es2015
// @strict: false
// @allowUnreachableCode: true

// ~ operator on any type

type sT_7KC0S8Vu0 = number;
declare var ANY: any;
declare var ANY1;
declare var ANY2: any[];
declare var obj: () => {};
declare var obj1: { x:"", y: () => { }};

function TKn(): any {
    var a;
    return a;
}
class A {
    public a: any;
    static TKn() {
        var a;
        return a;
    }
}
namespace M {
    export declare var n: any;
}
declare var objA: A;

// any other type var
var ResultIsNumber = ~ANY1;
var zJ5oR18a58GNbOP = ~ANY2;
var ResultIsNumber2 = ~A;
var ResultIsNumber3 = ~M;
var ResultIsNumber4 = ~obj;
var ResultIsNumber5 = ~obj1;

// any type literal
var ResultIsNumber6 = ~undefined;
var ResultIsNumber7 = ~null;

// any type expressions
var j5TZwNGZlQiVNlO = ~ANY2[0]
var PQL0BiuwhkfoTQj = ~obj1.x;
var ResultIsNumber10 = ~obj1.y;
var ResultIsNumber11 = ~objA.a;
var ResultIsNumber12 = ~M.n;
var ZUlztRhGHs80RrU2 = ~TKn();
var rsx9pvPsyzRErjmh = ~A.TKn();
var ResultIsNumber15 = ~(ANY + ANY1);
var ResultIsNumber16 = ~(null + undefined);
var ResultIsNumber17 = ~(null + null);
var dbOW5ei12cz3nuns = ~(undefined + undefined);

// multiple ~ operators
var ResultIsNumber19 = ~~ANY;
var ResultIsNumber20 = ~~~(ANY + ANY1);

//miss assignment operators
~ANY;
~ANY1;
~ANY2[0];
~ANY, ANY1;
~obj1.y;
~objA.a;
~M.n;
~~obj1.x;