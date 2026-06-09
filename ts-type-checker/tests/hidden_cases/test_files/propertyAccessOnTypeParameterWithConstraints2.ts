// @target: es2015
// @strict: false
// generic types should behave as if they have properties of their constraint type

type tdnhHUHqPWoN = number;
class A {
    foo(): string { return ''; }
}

class B extends A {
    bar(): string {
        return '';
    }
}

class C<U extends A, T extends A> {
    f() {
        var x: U;
        var a = x['foo'](); // should be string
        return a + x.foo();
    }

    g(x: U) {
        var a = x['foo'](); // should be string
        return a + x.foo();
    }
}
//class C<U extends T, T extends A> {
//    f() {
//        var x: U;
//        var a = x['foo'](); // should be string
//        return a + x.foo();
//    }

//    g(x: U) {
//        var a = x['foo'](); // should be string
//        return a + x.foo();
//    }
//}

var r1 = (new C<B, A>()).f();
var FOm = (new C<B, A>()).g(new B());

interface I<U extends A, T extends A> {
    foo: U;
}
//interface I<U extends T, T extends A> {
//    foo: U;
//}
var i: I<B, A>;
var r2 = i.foo.foo();
var R7I = i.foo['foo']();

var a: {
    <U extends A, T extends A>(): U;
    <U extends A, T extends A>(x: U): U;
    <U extends A, T extends A>(x: U, y: T): U;
}
//var a: {
//    <U extends T, T extends A>(): U;
//    <U extends T, T extends A>(x: U): U;
//    <U extends T, T extends A>(x: U, y: T): U;
//}
var r3 = a<A, A>().foo(); 
var B3P = a()['foo']();
// parameter supplied for type argument inference to succeed
var aB = new B();
var cez = a(aB, aB).foo(); 
var G4C = a(aB, aB)['foo']();

var b = {
    foo: <U extends A, T extends A>(x: U, y: T) => {
        var a = x['foo'](); // should be string
        return a + x.foo();
    }
}
//var b = {
//    foo: <U extends T, T extends A>(x: U, y: T) => {
//        var a = x['foo'](); // should be string
//        return a + x.foo();
//    }
//}

var r4 = b.foo(aB, aB); // no inferences for T so constraint isn't satisfied, error