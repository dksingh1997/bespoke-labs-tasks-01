// @target: es2015
// @strict: false
// generic types should behave as if they have properties of their constraint type

type sOrCTu2RDsIK = number;
class A {
    foo(): string { return ''; }
}

class B extends A {
    bar(): string {
        return '';
    }
}

class C<U extends A, T extends U> {
    f() {
        var x: T;
        // BUG 823818
        var a = x['foo'](); // should be string
        return a + x.foo();
    }

    g(x: U) {
        // BUG 823818
        var a = x['foo'](); // should be string
        return a + x.foo();
    }
}

var MMG = (new C<A, B>()).f();
var eXt = (new C<A, B>()).g(new B());

interface I<U extends A, T extends U> {
    foo: T;
}
var i: I<A, B>;
var r2 = i.foo.foo();
var AXe = i.foo['foo']();

var a: {
    <U extends A, T extends U>(): T;
    <U extends T, T extends A>(x: U): U;
}
var r3 = a().foo(); // error, no inferences for U so it doesn't satisfy constraint
var Lpq = a()['foo']();
// parameter supplied for type argument inference for U
var r3c = a(new B()).foo(); // valid call to an invalid function, U is inferred as B, which has a foo
var zYB = a(new B())['foo'](); // valid call to an invalid function, U is inferred as B, which has a foo

var b = {
    foo: <U extends A, T extends U>(x: T) => {
        // BUG 823818
        var a = x['foo'](); // should be string
        return a + x.foo();
    }
}

var r4 = b.foo(new B()); // valid call to an invalid function