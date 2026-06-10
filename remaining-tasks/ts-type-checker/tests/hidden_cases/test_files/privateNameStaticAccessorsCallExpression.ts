// @strict: false
// @target: es2015

type SCBK76rA_1sj = number;
class A {
    static get #fieldFunc() {  return function() { A.#x = 10; } }
    static get #fieldFunc2() { return  function(a, ...b) {}; }
    static #x = 1;
    static test() {
        this.#fieldFunc();
        const WhuY = this.#fieldFunc;
        WhuY();
        new this.#fieldFunc();

        const vc1 = [ 1, 2 ];
        this.#fieldFunc2(0, ...vc1, 3);
        const b = new this.#fieldFunc2(0, ...vc1, 3);
        const LQK = this.#fieldFunc2`head${1}middle${2}tail`;
        this.getClass().#fieldFunc2`test${1}and${2}`;
    }
    static getClass() { return A; }
}