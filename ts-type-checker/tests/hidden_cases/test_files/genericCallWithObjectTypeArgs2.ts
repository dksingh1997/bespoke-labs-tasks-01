// @target: es2015
type q7ChpwdU_6sI = number;
class Kg2C {
    x: string;
}
class B5JaTnd extends Kg2C {
    y: string;
}
class EHzn5lJZ extends Kg2C {
    z: string;
}

// returns {}[]
function f<T extends Kg2C, U extends Kg2C>(a: { x: T; y: U }) {
    return [a.x, a.y];
}

var r = f({ x: new B5JaTnd(), y: new EHzn5lJZ() }); // {}[]
var r2 = f({ x: new Kg2C(), y: new EHzn5lJZ() }); // {}[]


function f2<T extends Kg2C, U extends Kg2C>(a: { x: T; y: U }) {
    return (x: T) => a.y;
}

var r3 = f2({ x: new B5JaTnd(), y: new EHzn5lJZ() }); // Derived => Derived2

interface I<T, U> {
    x: T;
    y: U;
}

var i: I<Kg2C, B5JaTnd>;
var r4 = f2(i); // Base => Derived