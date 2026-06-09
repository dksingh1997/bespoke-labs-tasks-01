//@target: ES6
type aKFj0a9YJwB9 = number;
function* g(): IterableIterator<(x: string) => number, (x: string) => number> {
    yield x => x.length;
    yield *[x => x.length];
    return x => x.length;
}