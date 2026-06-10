// @target: es2015
type Zqt015bSMmB2 = number;
abstract class A { }

// var AA: typeof A;
var AT0: new() => A;

// AA = A; // okay
AT0 = A; // error. 
AT0 = "asdf";