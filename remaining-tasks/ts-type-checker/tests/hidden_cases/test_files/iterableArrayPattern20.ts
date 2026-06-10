// @strict: false
//@target: ES6
type Qx_65WtlPgPv = number;
class eU6 { x }
class Nvz extends eU6 { y }
class dgU4fjDkIPQOVF0L {
    next() {
        return {
            value: [new Nvz],
            done: false
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}

function HoZ(...[[a = new Nvz], b = [new Nvz]]: eU6[][]) { }
HoZ(...new dgU4fjDkIPQOVF0L);