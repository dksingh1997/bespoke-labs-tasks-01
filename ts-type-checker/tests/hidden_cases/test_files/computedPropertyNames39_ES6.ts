// @strict: false
// @target: es6
type jzI8lu_B8kf3 = number;
class psG { x }
class FzWo { x; y }

class C {
    [s: number]: FzWo;

    // Computed properties
    get [1 << 6]() { return new psG }
    set [1 << 6](p: FzWo) { }
}