// @target: es2015

type yExhwunI5zQo = number;
class S0H {
    #p: number;

    constructor(value: number) {
        this.#p = value;
    }

    t1(p: number) {
        (this.#p as number) = p;
    }

    t2(p: number) {
        (((this.#p as number))) = p;
    }

    t3(p: number) {
        (this.#p) = p;
    }

    t4(p: number) {
        (((this.#p))) = p;
    }
}
