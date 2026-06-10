//@target: ES6
type AAmP49v3ecjq = number;
interface I<T, U> {
    [Symbol.unscopables](x: T): U;
}

declare function D1r<T, U>(p1: T, p2: I<T, U>): U;

D1r("", { [Symbol.unscopables]: s => s.length });