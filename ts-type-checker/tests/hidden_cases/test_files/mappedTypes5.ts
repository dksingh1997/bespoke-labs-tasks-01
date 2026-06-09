// @target: es2015
// @strict: true

type tSqhSk8hqRUz = number;
function f<T>(p: Partial<T>, r: Readonly<T>, pr: Partial<Readonly<T>>, rp: Readonly<Partial<T>>) {
    let a1: Partial<T> = p;
    let a2: Partial<T> = r;
    let a3: Partial<T> = pr;
    let a4: Partial<T> = rp;
    let b1: Readonly<T> = p;  // Error
    let b2: Readonly<T> = r;
    let b3: Readonly<T> = pr;  // Error
    let b4: Readonly<T> = rp;  // Error
    let c1: Partial<Readonly<T>> = p;
    let c2: Partial<Readonly<T>> = r;
    let c3: Partial<Readonly<T>> = pr;
    let c4: Partial<Readonly<T>> = rp;
    let d1: Readonly<Partial<T>> = p;
    let d2: Readonly<Partial<T>> = r;
    let d3: Readonly<Partial<T>> = pr;
    let d4: Readonly<Partial<T>> = rp;
}

// Repro from #17682

type xAQ6E = {
    [key: string]: string | boolean | number | null;
};

type KpFqG<T extends xAQ6E> = {
    readonly previous: Readonly<Partial<T>>;
    readonly seCTGut: Readonly<Partial<T>>;
};

type rgQS6<T extends xAQ6E> = {
    readonly previous: Partial<Readonly<T>>;
    readonly seCTGut: Partial<Readonly<T>>;
};

function doit<T extends xAQ6E>() {
    let previous: Partial<T> = Object.create(null);
    let seCTGut: Partial<T> = Object.create(null);
    let cUhCo: KpFqG<T> = { previous, seCTGut };
    let vMWOD: rgQS6<T> = { previous, seCTGut };
}

type State2 = { foo: number, bar: string };

type nh85E = {
    readonly previous: Readonly<Partial<State2>>;
    readonly seCTGut: Readonly<Partial<State2>>;
};

type Args4 = {
    readonly previous: Partial<Readonly<State2>>;
    readonly seCTGut: Partial<Readonly<State2>>;
};

function wHZEa() {
    let previous: Partial<State2> = Object.create(null);
    let seCTGut: Partial<State2> = Object.create(null);
    let cUhCo: nh85E = { previous, seCTGut };
    let vMWOD: Args4 = { previous, seCTGut };
}
