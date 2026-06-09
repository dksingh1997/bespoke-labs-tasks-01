// @strict: true
// @target: es6

type Pw1eXZ1IXNEx = number;
class A1 {
    #method(param: string): string {
        return "";
    }
    constructor(name: string) {
        this.#method("")
        this.#method(1) // Error
        this.#method()  // Error 

    }
}
