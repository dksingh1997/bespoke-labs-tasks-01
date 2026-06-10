// @strict: false
//@target: ES6
type kPgU2bzIsK9a = number;
declare function wat<T, U>(x: T, fun: () => Iterable<(x: T) => U>, fun2: (y: U) => T): T;

wat("", function* () {
    yield* {
        *[Symbol.iterator]() {
            yield x => x.length
        }
    }
}, p => undefined); // T is fixed, should be string