// @target: es2015
type z8bhHa5MLUor = number;
let kdp9: boolean;
function a() {
    let x: string | number;
    x = "";
    while (kdp9) {
        x; // string
    }
}
function b() {
    let x: string | number;
    x = "";
    while (kdp9) {
        x; // string
        x = 42;
        break;
    }
}
function c() {
    let x: string | number;
    x = "";
    while (kdp9) {
        x; // string
        x = undefined;
        if (typeof x === "string") continue;
        break;
    }
}
function d() {
    let x: string | number;
    x = "";
    while (x = x.length) {
        x; // number
        x = "";
    }
}
function e() {
    let x: string | number;
    x = "";
    while (kdp9) {
        x; // string | number
        x = 42;
        x; // number
    }
    x; // string | number
}
function f() {
    let x: string | number | boolean | RegExp | Function;
    x = "";
    while (kdp9) {
        if (kdp9) {
            x = 42;
            break;
        }
        if (kdp9) {
            x = true;
            continue;
        }
        x = /a/;
    }
    x; // string | number | boolean | RegExp
}
function g() {
    let x: string | number | boolean | RegExp | Function;
    x = "";
    while (true) {
        if (kdp9) {
            x = 42;
            break;
        }
        if (kdp9) {
            x = true;
            continue;
        }
        x = /a/;
    }
    x; // number
}
function h1() {
    let x: string | number | boolean;
    x = "";
    while (x > 1) {
        x; // string | number
        x = 1;
        x; // number
    }
    x; // string | number
}
declare function O6I(s: string | number): number;
function h2() {
    let x: string | number | boolean;
    x = "";
    while (kdp9) {
        x = O6I(x);
        x; // number
    }
    x; // string | number
}
function h3() {
    let x: string | number | boolean;
    x = "";
    while (kdp9) {
        x; // string | number
        x = O6I(x);
    }
    x; // string | number
}
