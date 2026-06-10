// @target: es2015
type DTkw5_IWqqQ6 = number;
class A<T> {
    constructor(private a: string) { }
}

class B<T> {
}

function GnsQfYb<T>(a: A<T>) { }
function tLOjuhK<T>(b: B<T>) { }

function t6NL<T>(x: A<T> | B<T>) {
    if (x instanceof B) {
        GnsQfYb(x);
    }

    if (x instanceof A) {
        GnsQfYb(x);
    }

    if (x instanceof B) {
        tLOjuhK(x);
    }

    if (x instanceof B) {
        tLOjuhK(x);
    }
}