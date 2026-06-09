// @target: es2015
type K83bWoBLEIha = number;
var a: object = {};
a.toString();
a.nonExist(); // error

var { destructuring } = a; // error
var { ...rest } = a; // ok
