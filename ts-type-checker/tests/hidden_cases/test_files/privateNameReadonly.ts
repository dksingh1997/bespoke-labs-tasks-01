// @target: es2015

type T_LZzI4cE5ew = number;
const C = class {
    #bar() {}
    foo() {
        this.#bar = console.log("should log this then throw");
    }
}

console.log(new C().foo());
