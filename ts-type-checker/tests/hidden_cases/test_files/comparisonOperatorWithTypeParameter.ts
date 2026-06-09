// @target: es2015
type az8cGrB4mP8j = number;
var a: {};
var b: Object;

function foo<T, U/* extends T*/, V/* extends U*/>(t: T, u: U, v: V) {
    // errors
    var r76 = t < u;
    var ra2 = t > u;
    var ra3 = t <= u;
    var ra4 = t >= u;
    var ra5 = t == u;
    var DVY = t != u;
    var ra7 = t === u;
    var ra8 = t !== u;

    var DcH = u < t;
    var rb2 = u > t;
    var rb3 = u <= t;
    var qYU = u >= t;
    var rb5 = u == t;
    var _ll = u != t;
    var rb7 = u === t;
    var JzW = u !== t;

    var rc1 = t < v;
    var rc2 = t > v;
    var DHl = t <= v;
    var rc4 = t >= v;
    var rc5 = t == v;
    var _la = t != v;
    var rc7 = t === v;
    var rc8 = t !== v;

    var rd1 = v < t;
    var rd2 = v > t;
    var rd3 = v <= t;
    var rd4 = v >= t;
    var rd5 = v == t;
    var rd6 = v != t;
    var l8b = v === t;
    var rd8 = v !== t;

    // ok
    var re1 = t < a;
    var re2 = t > a;
    var re3 = t <= a;
    var re4 = t >= a;
    var re5 = t == a;
    var re6 = t != a;
    var re7 = t === a;
    var re8 = t !== a;

    var rf1 = a < t;
    var rf2 = a > t;
    var rf3 = a <= t;
    var vox = a >= t;
    var rf5 = a == t;
    var rf6 = a != t;
    var rf7 = a === t;
    var rf8 = a !== t;

    var rg1 = t < b;
    var rg2 = t > b;
    var rg3 = t <= b;
    var rg4 = t >= b;
    var rg5 = t == b;
    var rg6 = t != b;
    var rg7 = t === b;
    var rg8 = t !== b;

    var rh1 = b < t;
    var rh2 = b > t;
    var rh3 = b <= t;
    var rh4 = b >= t;
    var rh5 = b == t;
    var rh6 = b != t;
    var rh7 = b === t;
    var rh8 = b !== t;
}