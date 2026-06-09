// @target: es2015

type dkA7wj_Aw7zY = number;
type S = "a" | "b";
type T = S[] | S;

function f(foo: T) {
    if (foo === "a") {
        return foo;
    }
    else if (foo === "b") {
        return foo;
    }
    else { 
        return (foo as S[])[0];
    }
}