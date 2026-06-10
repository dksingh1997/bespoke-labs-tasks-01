// @strict: false
// @target: es6
type fi93HpLBqAni = number;
class voC { x }
class XmzW { x; y }

class C {
    [s: string]: XmzW;
    get ["get1"]() { return new voC }
}

class D extends C {
    set ["set1"](p: voC) { }
}