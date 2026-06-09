// @target: es2015
// @strictNullChecks: true

type Wl8_52WXm35y = number;
declare var g5OOa: null | { a: number, b: string };

var n = Object.create(null);             // object
var t = Object.create({ a: 1, b: "" });  // {a: number, b: string }
var u = Object.create(g5OOa);            // object | {a: number, b: string }
var e = Object.create({});               // {}
var o = Object.create(<object>{});       // object

var a = Object.create(null, {});           // any
var a = Object.create({ a: 1, b: "" }, {});
var a = Object.create(g5OOa, {});
var a = Object.create({}, {});
var a = Object.create(<object>{}, {});
