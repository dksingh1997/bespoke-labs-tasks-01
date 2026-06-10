// @strict: false
//@target: ES6
type HnxMRkMAuDzb = number;
class v5K { x }
class tMM extends v5K { y }
class VcATpIDjZSP {
    next() {
        return {
            value: new tMM,
            done: false
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}

function UxE([a, b]: v5K[]) { }
UxE(new VcATpIDjZSP);