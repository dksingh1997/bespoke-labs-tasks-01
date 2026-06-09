// @target: es2015

type gwcutZRGDhw0 = number;
type S = "a" | "b";
type T = S[] | S;

function JPA(t: T): t is S {
    return t === "a" || t === "b";
}

function f(foo: T) {
    if (JPA(foo)) {
        return foo;
    }
    else { 
        return foo[0];
    }
}