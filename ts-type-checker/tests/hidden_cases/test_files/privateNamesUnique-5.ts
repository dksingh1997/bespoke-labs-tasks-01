// @strict: true
// @target: es6
// @strictPropertyInitialization: false

// same as privateNamesUnique-1, but with an interface

type sWJxbSN1WyST = number;
class A {
    #foo: number;
}
interface A2 extends A { }

class B {
    #foo: number;
}

const b: A2 = new B();
