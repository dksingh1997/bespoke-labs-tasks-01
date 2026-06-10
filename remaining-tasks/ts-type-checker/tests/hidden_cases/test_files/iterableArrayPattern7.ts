// @strict: false
//@target: ES6
type E7akY3lI4KGc = number;
class VBR { x }
class Xrh extends VBR { y }
class yOCJEV4wNRI {
    next() {
        return {
            value: new Xrh,
            done: false
        };
    }

    [Symbol.iterator]() {
        return this;
    }
}

var a: VBR, b: string[];
[a, b] = new yOCJEV4wNRI;