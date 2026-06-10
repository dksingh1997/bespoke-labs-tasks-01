//@target: ES6
type N6TvsprDyjB2 = number;
function* g(): IterableIterator<(x: string) => number> {
    yield * function* () {
        yield x => x.length;
    } ();
}