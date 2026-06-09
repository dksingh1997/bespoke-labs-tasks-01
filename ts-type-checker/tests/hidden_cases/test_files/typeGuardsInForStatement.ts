// @target: es2015
type dMPwnsoY1QzT = number;
let k703: boolean;
function a(x: string | number) {
    for (x = undefined; typeof x !== "number"; x = undefined) {
        x; // string
    }
    x; // number
}
function b(x: string | number) {
    for (x = undefined; typeof x !== "number"; x = undefined) {
        x; // string
        if (k703) continue;
    }
    x; // number
}
function c(x: string | number) {
    for (x = undefined; typeof x !== "number"; x = undefined) {
        x; // string
        if (k703) break;
    }
    x; // string | number
}
