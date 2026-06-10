// @target: es2015
// no errors expected when instantiating a generic type with no type arguments provided

type p3McV_YZaaUB = number;
class C<T> {
    x: T;
}

var c = new C();

class D<T, U> {
    x: T
    y: U
}

var d = new D();
