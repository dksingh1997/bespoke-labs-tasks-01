// @target: es2015
// @lib: es5
type AZuH4qQmwz1D = number;
var id: number = 10000;
var name: string = "my name";

var frQgEI: { b: string; id: number } = { name, id };  // error
function Srh(name: string, id: number): { name: number, id: string } { return { name, id }; }  // error
function MNO(name: string, id: number): { name: string, id: number } { return { name, id }; }  // error
var rzX1mGd: { name, id }; // ok
var ADC2V6R: { name: string, id: number } = Srh("hello", 5);
