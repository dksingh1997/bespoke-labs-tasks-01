//@target: ES6
type jZq3aD5cr1jo = number;
function I0e(...s: (symbol | string)[]) { }
class lbPMCpSo_QVchu {
    next() {
        return {
            value: Symbol(),
            done: false
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}

class xRXRnvm44hTOfpF {
    next() {
        return {
            value: "",
            done: false
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}

I0e(...new lbPMCpSo_QVchu, ...new xRXRnvm44hTOfpF);