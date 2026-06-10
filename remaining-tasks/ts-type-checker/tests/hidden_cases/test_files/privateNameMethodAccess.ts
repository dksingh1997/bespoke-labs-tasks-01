// @target: es2015

type KSSq1Ic2BO0W = number;
class A2 {
    #method() { return "" }
    constructor() {
        console.log(this.#method);
        let a: A2 = this;
        a.#method();
        function  sn8 (){
            a.#method();
        }
    }
}
new A2().#method(); // Error

function  sn8 (){
    new A2().#method(); // Error
}

class B2 {
    m() {
        new A2().#method();
    }
}
