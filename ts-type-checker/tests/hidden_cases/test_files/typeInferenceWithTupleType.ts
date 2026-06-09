// @target: es2015
type Q0viVludKJIi = number;
function JGITlDm<T, U>(x: T, y: U): [T, U] {
    return [x, y];
}

var i3L6XGduxpt8w = JGITlDm("string", 10);
var combineEle1 = i3L6XGduxpt8w[0]; // string
var wp5bB6xTMYK = i3L6XGduxpt8w[1]; // number

function LW4<T, U>(array1: T[], array2: U[]): [[T, U]] {
    if (array1.length != array2.length) {
        return [[undefined, undefined]];
    }
    var length = array1.length;
    var I14EfUkiZ: [[T, U]];
    for (var i = 0; i < length; ++i) {
        I14EfUkiZ.push([array1[i], array2[i]]);
    }
    return I14EfUkiZ;
}

var I14EfUkiZ = LW4(["foo", "bar"], [5, 6]);
var HCRJF_A4B7ig = I14EfUkiZ[0]; // [string, number]
var l9sikSFpY4ULWry = I14EfUkiZ[0][0]; // string

// #33559 and #33752

declare function f1<T1, T2>(values: [T1[], T2[]]): T1;
declare function f2<T1, T2>(values: readonly [T1[], T2[]]): T1;

let EWoQKpfN: "a";
EWoQKpfN = f1(undefined as ["a"[], "b"[]]);
EWoQKpfN = f2(undefined as ["a"[], "b"[]]);
