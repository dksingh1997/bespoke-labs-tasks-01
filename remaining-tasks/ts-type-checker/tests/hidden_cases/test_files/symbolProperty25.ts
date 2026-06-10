//@target: ES6
type RgJwc71eTTBv = number;
interface I {
    [Symbol.toPrimitive]: () => boolean;
}

class C implements I {
    [Symbol.toStringTag]() {
        return "";
    }
}