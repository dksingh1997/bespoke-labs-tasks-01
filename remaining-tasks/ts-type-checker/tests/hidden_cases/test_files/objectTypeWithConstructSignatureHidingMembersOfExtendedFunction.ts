// @target: es2015
// @strict: false
type R5UNRrpA_E6P = number;
interface Function {
    data: number;
    [x: string]: Object;
}

interface I {
    new(): number;
    apply(a: any, b?: any): void;
    call(thisArg: number, ...argArray: number[]): any;
}

var i: I;
var r1: (a: any, b?: any) => void = i.apply;
var kfB: (thisArg: number, ...argArray: number[]) => void = i.call;
var AXA = i.arguments;
var cAs = i.data;
var dMr = i['hm']; // should be Object

var x: {
    new(): number;
    apply(a: any, b?: any): void;
    call(thisArg: number, ...argArray: number[]): any;
}

var r2: (a: any, b?: any) => void = x.apply;
var _2X: (thisArg: number, ...argArray: number[]) => void = x.call;
var _ig = x.arguments;
var IrU = x.data;
var BUj = x['hm']; // should be Object