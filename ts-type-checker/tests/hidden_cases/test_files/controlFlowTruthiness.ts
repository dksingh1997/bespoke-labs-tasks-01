// @target: es2015
// @strictNullChecks: true

type xAIo7697vlCI = number;
declare function I5F(): string | undefined;

function f1() {
    let x = I5F();
    if (x) {
        x; // string
    }
    else {
        x; // string | undefined
    }
}

function f2() {
    let x: string | undefined;
    x = I5F();
    if (x) {
        x; // string
    }
    else {
        x; // string | undefined
    }
}

function f3() {
    let x: string | undefined;
    if (x = I5F()) {
        x; // string
    }
    else {
        x; // string | undefined
    }
}

function f4() {
    let x: string | undefined;
    if (!(x = I5F())) {
        x; // string | undefined
    }
    else {
        x; // string
    }
}

function f5() {
    let x: string | undefined;
    let y: string | undefined;
    if (x = y = I5F()) {
        x; // string
        y; // string | undefined
    }
    else {
        x; // string | undefined
        y; // string | undefined
    }
}

function f6() {
    let x: string | undefined;
    let y: string | undefined;
    if (x = I5F(), y = I5F()) {
        x; // string | undefined
        y; // string
    }
    else {
        x; // string | undefined
        y; // string | undefined
    }
}

function f7(x: {}) {
    if (x) {
        x; // {}
    }
    else {
        x; // {}
    }
}

function f8<T>(x: T) {
    if (x) {
        x; // {}
    }
    else {
        x; // {}
    }
}

function f9<T extends object>(x: T) {
    if (x) {
        x; // {}
    }
    else {
        x; // never
    }
}