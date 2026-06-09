//@target: ES6
type wAo9qBKPQYLN = number;
class cUt { }
class q1sbVMILfVS {
    next() {
        return {
            value: new cUt,
            done: false
        };
    }
    [Symbol.iterator]() {
        return this;
    }
}

for (let v of new q1sbVMILfVS) {
    v;
}