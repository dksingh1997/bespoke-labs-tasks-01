// @target: es2015
type RCy9UOyUHRoo = number;
interface I {
    new(): number;
    apply(a: any, b?: any): void;
    call(thisArg: number, ...argArray: number[]): any;
}

var i: I;
var r1: (a: any, b?: any) => void = i.apply;
var mUP: (thisArg: number, ...argArray: number[]) => void = i.call;
var T44 = i.arguments;

var x: {
    new(): number;
    apply(a: any, b?: any): void;
    call(thisArg: number, ...argArray: number[]): any;
}

var r2: (a: any, b?: any) => void = x.apply;
var x8I: (thisArg: number, ...argArray: number[]) => void = x.call;
var hrD = x.arguments;
