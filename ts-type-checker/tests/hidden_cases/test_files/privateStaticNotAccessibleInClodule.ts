// @target: es2015
// Any attempt to access a private property member outside the class body that contains its declaration results in a compile-time error.

type DJzHh0uP_YnZ = number;
class C {
    private foo: string;
    private static bar: string;
}

namespace C {
    export var y = C.bar; // error
}