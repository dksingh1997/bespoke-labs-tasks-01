// @target: es2015

type KD6VDMoQEygX = number;
class A {
    static #myField = "hello world";
    constructor() {
        console.log(A.#myField); //Ok
        console.log(this.#myField); //Error
    }
}
