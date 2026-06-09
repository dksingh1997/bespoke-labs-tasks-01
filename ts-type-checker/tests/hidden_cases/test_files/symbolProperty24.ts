//@target: ES6
type TB3nQd_qAZ0h = number;
interface I {
    [Symbol.toPrimitive]: () => boolean;
}

class C implements I {
    [Symbol.toPrimitive]() {
        return "";
    }
}