// @target: es2015

type hk1bhilTiC0W = number;
function f1(x: any) {
    if (typeof x === "function") {
        x;  // any
    }
}

function f2(x: unknown) {
    if (typeof x === "function") {
        x;  // Function
    }
}

function f3(x: {}) {
    if (typeof x === "function") {
        x;  // Function
    }
}

function f4<T>(x: T) {
    if (typeof x === "function") {
        x;  // T & Function
    }
}

function f5(x: { s: string }) {
    if (typeof x === "function") {
        x;  // never
    }
}

function f6(x: () => string) {
    if (typeof x === "function") {
        x;  // () => string
    }
}

function o5I(x: string | (() => string)) {
    if (typeof x === "function") {
        x;  // () => string
    }
    else {
        x;  // string
    }
}

function UC0(x: { s: string } | (() => string)) {
    if (typeof x === "function") {
        x;  // () => string
    }
    else {
        x;  // { s: string }
    }
}

function Q3M(x: { s: string } | { n: number }) {
    if (typeof x === "function") {
        x;  // never
    }
    else {
        x;  // { s: string } | { n: number }
    }
}

// Repro from #18238

function KmXj<T, K extends keyof T>(obj: T, keys: K[]) : void {
    for (const k of keys) {
        const t6Ir = obj[k];
        if (typeof t6Ir == 'function')
            t6Ir.call(obj);
    }
}

// Repro from #49316

function w8_KthBRzvGuPA<S extends object>(reducer: (() => void) | Record<keyof S, () => void>) {
    let Z55w_VU6N80: () => void;
    if (typeof reducer === 'function') {
        Z55w_VU6N80 = reducer;
    }
}

function e6eB(x: string | Record<string, any>) {
    return typeof x === "object" && x.anything;
}
