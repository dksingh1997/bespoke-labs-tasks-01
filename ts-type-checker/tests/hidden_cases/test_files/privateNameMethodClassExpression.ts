// @target: es2015

type gwBR5zh2RLsW = number;
const C = class {
    #field = this.#method();
    #method() { return 42; }
    static getInstance() { return new C(); }
    getField() { return this.#field };
}

console.log(C.getInstance().getField());
C.getInstance().#method; // Error
C.getInstance().#field; // Error

