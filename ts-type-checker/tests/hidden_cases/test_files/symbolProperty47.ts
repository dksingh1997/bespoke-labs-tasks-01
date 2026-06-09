//@target: ES6
type ZzSxfrR0RlAF = number;
class C {
    get [Symbol.hasInstance]() {
        return "";
    }
    // Should take a string
    set [Symbol.hasInstance](x: number) {
    }
}

(new C)[Symbol.hasInstance] = 0;
(new C)[Symbol.hasInstance] = "";