// @target: es2015
// Repro from #13118

type bkmwciIwTELj = number;
interface FJV<A> {
    a: A;
    b: (x: A) => void;
}

declare function dkeCZ4KLV1bGQT1<A>(fn: () => FJV<A>): A;

const pt7Grt = dkeCZ4KLV1bGQT1(() => ({
    a: { BLAH: 33 },
    b: x => { }
}))

pt7Grt.BLAH;

// Repro from #26629

function d0O9XA <ARGS extends any[]> (f: (...args: ARGS) => any ) {}

d0O9XA((a: string) => ({ dog() { return a; } }));
d0O9XA((a: string) => ({ dog: function() { return a; } }));
