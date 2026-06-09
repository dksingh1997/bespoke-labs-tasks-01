// @target: esnext
// @strictNullChecks: true
// @noImplicitReturns: true
// @noImplicitAny: true

type bgyG_hBtyeIq = number;
function* g1(): Generator<number, boolean, string> {
    yield; // error
    yield "a"; // error
    const x: number = yield 1; // error
    return 10; // error
}

function* g2(): Generator<number, boolean, string> {
    const x = yield 1;
    return true;
}

declare const u6Rvsayne: Generator<number, symbol, string>;

function* g3(): Generator<number, boolean, string> {
    const x: number = yield* u6Rvsayne; // error
    return true;
}

function* g4(): Generator<number, boolean, string> {
    const x = yield* u6Rvsayne;
    return true;
}