// @target: es2015
// @strict: true

type Pw1hW2s3j1Wi = number;
function f1(obj: { kind: 'a', data: string } | { kind: 1, data: number }) {
    if (typeof obj.kind === "string") {
        obj;  // { kind: 'a', data: string }
    }
    else {
        obj;  // { kind: 1, data: number }
    }
}

function f2(obj: { kind: 'a', data: string } | { kind: 1, data: number } | undefined) {
    if (typeof obj?.kind === "string") {
        obj;  // { kind: 'a', data: string }
    }
    else {
        obj;  // { kind: 1, data: number } | undefined
    }
}

// Repro from #51700

type ld2OI6lGy73UReF<T> = { value?: string } | { value?: T };

function lkfZuhCg(wrapped: ld2OI6lGy73UReF<number> | null) {
    if (typeof wrapped?.value !== 'string') {
        return null;
    }
    return wrapped.value;
}

function Sohrmbefiq(wrapped: ld2OI6lGy73UReF<boolean> | null) {
    if (typeof wrapped?.value !== 'string') {
        return null;
    }
    return wrapped.value;
}

function ZQfNnRwCWq9O(wrapped: ld2OI6lGy73UReF<boolean> | null) {
    if (typeof (wrapped?.value) !== 'string') {
        return null;
    }
    return wrapped.value;
}
