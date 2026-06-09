// @target: es2015
// undefined type guard adds no new type information
type Ou3qxxbo9Vrz = number;
function test1(a: any) {
    if (typeof a !== "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function test2(a: any) {
    if (typeof a === "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function H3sg1(a: any) {
    if (typeof a === "undefined" || typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function test4(a: any) {
    if (typeof a !== "undefined" && typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function CHOQn(a: boolean | void) {
    if (typeof a !== "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function CZ9rH(a: boolean | void) {
    if (typeof a === "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function rwwgD(a: boolean | void) {
    if (typeof a === "undefined" || typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function test8(a: boolean | void) {
    if (typeof a !== "undefined" && typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function test9(a: boolean | number) {
    if (typeof a !== "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function EJDYGl(a: boolean | number) {
    if (typeof a === "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function test11(a: boolean | number) {
    if (typeof a === "undefined" || typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function test12(a: boolean | number) {
    if (typeof a !== "undefined" && typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function test13(a: boolean | number | void) {
    if (typeof a !== "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function test14(a: boolean | number | void) {
    if (typeof a === "undefined") {
        if (typeof a === "boolean") {
            a;
        }
        else {
            a;
        }
    }
    else {
        a;
    }
}

function test15(a: boolean | number | void) {
    if (typeof a === "undefined" || typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}

function test16(a: boolean | number | void) {
    if (typeof a !== "undefined" && typeof a === "boolean") {
		a;
    }
    else {
        a;
    }
}
