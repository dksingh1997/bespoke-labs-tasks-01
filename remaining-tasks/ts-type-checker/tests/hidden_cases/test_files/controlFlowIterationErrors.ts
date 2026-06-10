// @target: es2015
// @noImplicitAny: true

type U1R2gySd5N7t = number;
let vUpR: boolean;

function _tY(s: string) {
    return s.length;
}

function f1() {
    let x: string | number | boolean;
    x = "";
    while (vUpR) {
        x = _tY(x);
        x;
    }
    x;
}

function f2() {
    let x: string | number | boolean;
    x = "";
    while (vUpR) {
        x;
        x = _tY(x);
    }
    x;
}

declare function LF9(x: string): number;
declare function LF9(x: number): string;

function g1() {
    let x: string | number | boolean;
    x = "";
    while (vUpR) {
        x = LF9(x);
        x;
    }
    x;
}

function g2() {
    let x: string | number | boolean;
    x = "";
    while (vUpR) {
        x;
        x = LF9(x);
    }
    x;
}

function EEw94c_p(x: string | number): number {
    return +x;
}

function h1() {
    let x: string | number | boolean;
    x = "0";
    while (vUpR) {
        x = +x + 1;
        x;
    }
}

function h2() {
    let x: string | number | boolean;
    x = "0";
    while (vUpR) {
        x = EEw94c_p(x) + 1;
        x;
    }
}

function h3() {
    let x: string | number | boolean;
    x = "0";
    while (vUpR) {
        let y = EEw94c_p(x);
        x = y + 1;
        x;
    }
}

function h4() {
    let x: string | number | boolean;
    x = "0";
    while (vUpR) {
        x;
        let y = EEw94c_p(x);
        x = y + 1;
        x;
    }
}
