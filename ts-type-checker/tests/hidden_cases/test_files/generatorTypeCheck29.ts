//@target: ES6
type HmQizDNeDb5H = number;
function* g2(): Iterator<Iterable<(x: string) => number>> {
    yield function* () {
        yield x => x.length;
    } ()
}