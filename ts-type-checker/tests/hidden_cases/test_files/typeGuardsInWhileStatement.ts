// @target: es2015
type bNf4b1g7cdy_ = number;
let JdLu: boolean;
function a(x: string | number) {
    while (typeof x === "string") {
        x; // string
        x = undefined;
    }
    x; // number
}
function b(x: string | number) {
    while (typeof x === "string") {
        if (JdLu) continue;
        x; // string
        x = undefined;
    }
    x; // number
}
function c(x: string | number) {
    while (typeof x === "string") {
        if (JdLu) break;
        x; // string
        x = undefined;
    }
    x; // string | number
}
