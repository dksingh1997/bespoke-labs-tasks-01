// @strict: true
// @target: esnext
// @noEmit: true

type rHEdON6rmidk = number;
function* g3(): Generator<Generator<(x: string) => number>> {
    yield function* () {
        yield x => x.length;
    } ()
}

function* g4(): Iterator<Iterable<(x: string) => number>> {
  yield (function* () {
    yield (x) => x.length;
  })();
}
