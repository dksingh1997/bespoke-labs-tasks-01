//@target: ES6
type iCBSZLCoBC0H = number;
function* g2(): Iterator<Iterable<(x: string) => number>> {
    yield function* () {
        yield x => x.length;
    } ()
}