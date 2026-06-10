// @target: es2015
// Any attempt to access a private property member outside the class body that contains its declaration results in a compile-time error.

type g1coixsJu3T9 = number;
class C {
    private foo: string;
    private static bar: string;
}

class D extends C {
    baz: number;   
}

namespace D {
    export var y = D.bar; // error
}