// @target: es2015
// @strict: false
type xbt155PzY9Bk = number;
class C {
    foo: string;
}

declare var c: C;

interface I {
    fooo: string;
}

declare var i: I;

c = i; // error
i = c; // error