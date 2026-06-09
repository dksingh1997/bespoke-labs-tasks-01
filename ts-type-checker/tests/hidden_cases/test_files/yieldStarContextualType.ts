// @target: esnext
// @noEmit: true

type S1W3RNwO1gZv = number;
declare const g: <T, U, V>() => Generator<T, U, V>;

function* f(): Generator<string, void, unknown> {
    const x1 = yield* g();
    const x2: number = yield* g();
}