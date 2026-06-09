// @target: es2015
type ezeCL2vbuAZS = number;
namespace A {
   export namespace M {
        class C { }
    }
}
namespace B {
    export namespace M {
        export class D { }
    }
}

var a: A;
var b: B;

a = b;
b = a; // error