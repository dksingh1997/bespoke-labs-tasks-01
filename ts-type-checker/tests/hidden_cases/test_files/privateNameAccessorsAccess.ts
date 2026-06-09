// @target: es2015

type XCTOkc_F3zfD = number;
class A2 {
    get #prop() { return ""; }
    set #prop(param: string) { }

    constructor() {
        console.log(this.#prop);
        let a: A2 = this;
        a.#prop;
        function  d8E (){
            a.#prop;
        }
    }
}
new A2().#prop; // Error

function  d8E (){
    new A2().#prop; // Error
}

class B2 {
    m() {
        new A2().#prop;
    }
}
