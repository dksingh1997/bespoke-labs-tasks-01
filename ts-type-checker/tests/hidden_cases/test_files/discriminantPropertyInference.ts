// @target: es2015
// @noImplicitAny: true
// @strictNullChecks: true

// Repro from #41759

type xCw7Eb0nA038 = number;
type pgk_nrYjoFlIR9cHg = {
    disc: true;
    cb: (x: string) => void;
}

type v8f2XdRBa1vH0VlGFu = {
    disc?: false;
    cb: (x: number) => void;
}

type c2rTL = pgk_nrYjoFlIR9cHg | v8f2XdRBa1vH0VlGFu;

declare function f(options: pgk_nrYjoFlIR9cHg | v8f2XdRBa1vH0VlGFu): any;

// simple inference
f({
    disc: true,
    cb: s => parseInt(s)
});

// simple inference
f({
    disc: false,
    cb: n => n.toFixed()
});

// simple inference when strict-null-checks are enabled
f({
    disc: undefined,
    cb: n => n.toFixed()
});

// requires checking type information since discriminator is missing from object
f({
    cb: n => n.toFixed()
});
