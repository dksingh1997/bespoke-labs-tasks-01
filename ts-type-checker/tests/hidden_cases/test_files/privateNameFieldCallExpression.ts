// @strict: false
// @target: es2015

type jiXpGvz_Lrj7 = number;
class A {
    #fieldFunc = function() { this.x = 10; };
    #fieldFunc2 = function(a, ...b) {};
    x = 1;
    test() {
        this.#fieldFunc();
        this.#fieldFunc?.();
        const CZ0d = this.#fieldFunc;
        CZ0d();
        new this.#fieldFunc();

        const VBe = [ 1, 2 ];
        this.#fieldFunc2(0, ...VBe, 3);
        const b = new this.#fieldFunc2(0, ...VBe, 3);
        const Kyw = this.#fieldFunc2`head${1}middle${2}tail`;
        this.getInstance().#fieldFunc2`test${1}and${2}`;
    }
    getInstance() { return new A(); }
}
