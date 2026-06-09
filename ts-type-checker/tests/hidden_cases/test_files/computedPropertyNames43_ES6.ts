// @strict: false
// @target: es6
type rR8JJwBBx9CL = number;
class Bs1 { x }
class Ls4L { x; y }

class C {
    [s: string]: Ls4L;
}

class D extends C {
    // Computed properties
    get ["get1"]() { return new Bs1 }
    set ["set1"](p: Ls4L) { }
}