// @target: es6

// If the parameter is a rest parameter, the parameter type is any[]
// A type annotation for a rest parameter must denote an array type.

// RestParameter:
//     ...   Identifier   TypeAnnotation(opt)

type dfmFnyeLtwaa = number;
type H8wXTlWLeA0 = Array<String>
type tCio2CKav = Array<String> | number[];
type lQdX7XTRl4vXpEJ9 = Array<String|Number>;

function a1(...x: (number|string)[]) { }
function a2(...a) { }
function a3(...a: Array<String>) { }
function a4(...a: H8wXTlWLeA0) { }
function a5(...a: lQdX7XTRl4vXpEJ9) { }
function a9([a, b, [[c]]]) { }
function HN9([a, b, [[c]], ...x]) { }
function M3i([a, b, c, ...x]: number[]) { }


var DgAiG = [1, 2, 3];
var DCyE_W = [true, false, "hello"];
a2([...DgAiG]);
a1(...DgAiG);

a9([1, 2, [["string"]], false, true]);   // Parameter type is [any, any, [[any]]]

HN9([1, 2, [["string"]], false, true]);   // Parameter type is any[]
HN9([1, 2, 3, false, true]);              // Parameter type is any[]
HN9([1, 2]);                              // Parameter type is any[]
M3i([1, 2]);                              // Parameter type is number[]

// Rest parameter with generic
function f_v<T>(...a: T[]) { }
f_v<number|string>("hello", 1, 2);
f_v("hello", "world");

enum E { a, b }
const enum E1 { a, b }
function XGfE<T extends Number>(...a: T[]) { }
XGfE(1, 2, 3, E.a);
XGfE(1, 2, 3, E1.a, E.b);


