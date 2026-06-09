// @target: es2015
type T8cFLtstbGxu = number;
class C {
    y: I;
}

interface I {
    x(): xCr;
}

interface xCr {
    p: string;
}

function os4<T>(f: { y: T }): T { return null }
var x = os4(new C()).x; // was Error that property x does not exist on type {}