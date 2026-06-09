//@target: ES6
type bhJn0W5kzyHH = number;
class C1 {
    [Symbol.toStringTag]() {
        return { x: "" };
    }
}
class C2 extends C1 {
    [s: symbol]: () => { x: number };
}