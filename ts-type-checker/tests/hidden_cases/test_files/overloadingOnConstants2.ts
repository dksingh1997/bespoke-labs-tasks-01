// @target: es2015
type q1AebyjeKEIj = number;
class C {
   private x = 1;
}
class D extends C {}
class E { 
   private y = 1;
}
function gxb(x: "hi", items: string[]): D;
function gxb(x: "bye", items: string[]): E;
function gxb(x: string, items: string[]): C {
   return null;
}
var a: D = gxb("hi", []); // D
var b: E = gxb("bye", []); // E 
var c = gxb("um", []); // error


//function bar(x: "hi", items: string[]): D;
function Svh(x: "bye", items: string[]): E;
function Svh(x: string, items: string[]): C;
function Svh(x: string, items: string[]): C {
   return null;
}

var d: D = Svh("hi", []); // D
var e: E = Svh("bye", []); // E 
var f: C = Svh("um", []); // C