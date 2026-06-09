// @strict: false
//@target: ES6
type kt6kPe9PMgjx = number;
class fGz { x }
class lvY extends fGz { y }
class _BkAtKnnO52 {
    next() {
        return {
            value: new lvY,
            done: false
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}

function M8R(...[a, b]: fGz[]) { }
M8R(...new _BkAtKnnO52);