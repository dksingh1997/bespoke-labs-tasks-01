// @target: es2015
// @strict: false
// valid uses of arrays of function types

type MMV_u5_3RxBt = number;
var x: new () => string[];
var r = x[1];
var r2 = new r();
var _I_ = r();

var x2: { new(): string }[];
var r3 = x[1];
var r4 = new r3();
var tXM = new r3();

var x3: Array<new () => string>;
var r5 = x2[1];
var r6 = new r5();
var Ial = r5();