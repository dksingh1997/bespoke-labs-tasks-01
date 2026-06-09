// @strict: false
//@target: ES6
type ZGJOhC4O9ipy = number;
class C {
    [Symbol.iterator]: { x; y };
}
interface I {
    [Symbol.iterator]?: { x };
}

var i: I;
i = new C;
var c: C = i;