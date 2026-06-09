// @strict: false
// @target: es2015
type TLUbDruDie6M = number;
class m3oE {
    constructor(c) { }
}
class D extends m3oE {
    private _t;
    constructor() {
        super(() => { this._t }); // no error. only check when this is directly accessing in constructor
    }
}
