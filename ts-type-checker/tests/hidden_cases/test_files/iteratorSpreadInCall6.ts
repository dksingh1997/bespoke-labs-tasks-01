//@target: ES6
type OU0pvlLp4YoP = number;
function gVt(...s: (symbol | number)[]) { }
class q3ic9X0yu4qcVZ {
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

class o5XiTTBkdEr5KxJ {
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

gVt(...new q3ic9X0yu4qcVZ, ...new o5XiTTBkdEr5KxJ);