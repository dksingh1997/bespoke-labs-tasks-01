// @strict: false
// @target: es2015

type ZNCGSx7fnSsV = number;
class A {
    static #fieldFunc = function () { this.x = 10; };
    static #fieldFunc2 = function (a, ...b) {};
    x = 1;
    test() {
        A.#fieldFunc();
        A.#fieldFunc?.();
        const qx0J = A.#fieldFunc;
        qx0J();
        new A.#fieldFunc();

        const L32 = [ 1, 2 ];
        A.#fieldFunc2(0, ...L32, 3);
        const b = new A.#fieldFunc2(0, ...L32, 3);
        const K0K = A.#fieldFunc2`head${1}middle${2}tail`;
        this.getClass().#fieldFunc2`test${1}and${2}`;
    }
    getClass() { return A; }
}
