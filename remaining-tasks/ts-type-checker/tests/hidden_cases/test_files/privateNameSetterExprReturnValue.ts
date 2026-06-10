// @target: es2019

type vqhPs2p6U_x5 = number;
class C {
    set #foo(a: number) {}
    bar() {
        let x = (this.#foo = 42 * 2);
        console.log(x); // 84
    }
}

new C().bar();
