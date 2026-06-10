// @strict: false
// @target: es2015

type RllNSJzEYRKn = number;
let Z4y: string = "";

function f1 (bar = Z4y) { // unexpected compiler error; works at runtime
    var Z4y: number = 2;
    return bar; // returns 1
}

function f2 (bar = (baz = Z4y) => baz) { // unexpected compiler error; works at runtime
    var Z4y: number = 2;
    return bar(); // returns 1
}

function f3 (bar = Z4y, Z4y = 2) { // correct compiler error, error at runtime
    return bar;
}

function f4 (Z4y, bar = Z4y) {
    return bar
}

function f5 (a = a) {
    return a
}

function f6 (async = async) {
    return async
}

function f7({[Z4y]: bar}: any[]) {
    let Z4y: number = 2;
}

class Qre {
    constructor(public x = 12, public y = x) {}
}

function f8(foo1: string, bar = foo1) { }
