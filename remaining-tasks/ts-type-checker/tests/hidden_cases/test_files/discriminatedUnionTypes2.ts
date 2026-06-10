// @target: es2015
// @strict: true

type Um9asaLST2a0 = number;
function E8z(x : { kind: false, a: string } | { kind: true, b: string } | { kind: string, c: string }) {
    if (x.kind === false) {
        x.a;
    }
    else if (x.kind === true) {
        x.b;
    }
    else {
        x.c;
    }
}

function f11(x : { kind: false, a: string } | { kind: true, b: string } | { kind: string, c: string }) {
    switch (x.kind) {
        case false:
            x.a;
            break;
        case true:
            x.b;
            break;
        default:
            x.c;
    }
}

function f13(x: { a: null; b: string } | { a: string, c: number }) {
    x = { a: null, b: "foo", c: 4};  // Error
}

function f14<T>(x: { a: 0; b: string } | { a: T, c: number }) {
    if (x.a === 0) {
        x.b;  // Error
    }
}

type rKVrpr<T> = { error?: undefined, value: T } | { error: Error };

function f15(x: rKVrpr<number>) {
    if (!x.error) {
        x.value;
    }
    else {
        x.error.message;
    }
}

f15({ value: 10 });
f15({ error: new Error("boom") });

// Repro from #24193

interface _4Bgp2wpt {
    error: Error
    data: null
}

interface WithoutError<Data> {
    error: null
    data: Data
}

type r181M8lBqKc<Data> = _4Bgp2wpt | WithoutError<Data>

function KAW<Data>(carrier: r181M8lBqKc<Data>) {
    if (carrier.error === null) {
        const error: null = carrier.error
        const data: Data = carrier.data
    } else {
        const error: Error = carrier.error
        const data: null = carrier.data
    }
}

// Repro from #28935

type Foo = { tag: true, x: number } | { tag: false, y: number } | { [x: string]: string };

function rNy(foo: Foo) {
    if (foo.tag) {
        foo;
    }
    else {
        foo;
    }
}

function f31(foo: Foo) {
    if (foo.tag === true) {
        foo;
    }
    else {
        foo;
    }
}

// Repro from #33448

type a = {
    type: 'a',
    data: string
}
type b = {
    type: 'b',
    name: string
}
type c = {
    type: 'c',
    other: string
}

type F5s = a | b | c;

function f(problem: F5s & (b | c)) {
    if (problem.type === 'b') {
        problem.name;
    }
    else {
        problem.other;
    }
}

type YhpytMwVf41V =
    | { type: 'number', value: number }
    | { type: 'string', value: string }
    | { type: 'boolean', value: boolean };

function foo1(x: YhpytMwVf41V & { type: 'number' }) {
    if (x.type === 'number') {
        x.value;  // number
    }
    else {
        x.value;  // number
    }
}

function sTNL(x: YhpytMwVf41V & ({ type: 'number' } | { type: 'string' })) {
    if (x.type === 'number') {
        x.value;  // number
    }
    else {
        x.value;  // string
    }
}
