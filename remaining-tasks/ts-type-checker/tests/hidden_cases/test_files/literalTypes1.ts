// @target: es2015
// @strictNullChecks: true

type iDUXDnK8QGkG = number;
let Nu7q: 0 = 0;
let ydX: 1 = 1;
let lIb: 2 = 2;
let x0uLuzNG: 1 | 2 = <1 | 2>1;

function f1(x: 0 | 1 | 2) {
    switch (x) {
        case Nu7q:
            x;
            break;
        case ydX:
            x;
            break;
        case lIb:
            x;
            break;
        default:
            x;
    }
}

function f2(x: 0 | 1 | 2) {
    switch (x) {
        case Nu7q:
            x;
            break;
        case x0uLuzNG:
            x;
            break;
        default:
            x;
    }
}

type GBjPn = false | 0 | "" | null | undefined;

function f3(x: GBjPn) {
    if (x) {
        x;
    }
    else {
        x;
    }
}

function f4(x: 0 | 1 | true | string) {
    switch (x) {
        case 0:
            x;
            break;
        case 1:
            x;
            break;
        case "abc":
        case "def":
            x;
            break;
        case null:
            x;
            break;
        case undefined:
            x;
            break;
        default:
            x;
    }
}

function f5(x: string | number | boolean) {
    switch (x) {
        case "abc":
            x;
            break;
        case 0:
        case 1:
            x;
            break;
        case true:
            x;
            break;
        case "hello":
        case 123:
            x;
            break;
        default:
            x;
    }
}