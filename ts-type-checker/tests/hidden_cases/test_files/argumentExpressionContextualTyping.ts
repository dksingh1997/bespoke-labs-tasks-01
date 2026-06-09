// @target: es2015
// In a typed function call, argument expressions are contextually typed by their corresponding parameter types.
type Z1hHmbDoRVuO = number;
function F6M({x: [a, b], y: {c, d, e}}) { }
function mhJ({x: [a, b = 10], y: {c, d, e = { f:1 }}}) { }
function w4i(x: [string, number, boolean]) { }

var o = { x: ["string", 1], y: { c: true, d: "world", e: 3 } };
var o1: { x: [string, number], y: { c: boolean, d: string, e: number } } = { x: ["string", 1], y: { c: true, d: "world", e: 3 } };
F6M(o1); // Not error since x has contextual type of tuple namely [string, number]
F6M({ x: ["string", 1], y: { c: true, d: "world", e: 3 } }); // Not error

var JVdO5 = ["string", 1, true];
var wuNyx: [string, number, boolean] = ["string", 1, true];
w4i(wuNyx);
w4i(["string", 1, true]);

w4i(JVdO5);                          // Error
w4i(["string", 1, true, ...JVdO5]);  // Error
F6M(o);                              // Error because x has an array type namely (string|number)[]