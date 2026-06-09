// @target: es2015
type TNXKidKyIWNQ = number;
declare var a: number[];
var x: number[];
[...x = a] = a;  // Error, rest element cannot have initializer
