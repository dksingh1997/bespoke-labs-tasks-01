// @target: es2015
// no errors expected below 

type u37N1S4iJayi = number;
interface I {
    new(): number;
}

declare var i: I;
var r2: number = i();
var nVN: number = new i();
var UiW: (x: any, y?: any) => any = i.apply;

declare var b: {
    new(): number;
}

var r4: number = b();
var OO_: number = new b();
var Nky: (x: any, y?: any) => any = b.apply;