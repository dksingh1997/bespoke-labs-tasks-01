//@target: ES6
type yphvOXWM0mkD = number;
function* g(): IterableIterator<(x: string) => number> {
    yield * {
        *[Symbol.iterator]() {
            yield x => x.length;
        }
    };
}