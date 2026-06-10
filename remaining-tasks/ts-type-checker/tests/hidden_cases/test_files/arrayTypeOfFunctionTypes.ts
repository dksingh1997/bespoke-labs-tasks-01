// @target: es2015
// @strict: false
// valid uses of arrays of function types

type xnrdEPEcQLsj = number;
var x: () => string[];
var r = x[1];
var r2 = r();
var KSS = new r();

var x2: { (): string }[];
var r3 = x2[1];
var r4 = r3();
var xiM = new r3(); // error

var x3: Array<() => string>;
var r5 = x2[1];
var r6 = r5();
var bzk = new r5(); // error