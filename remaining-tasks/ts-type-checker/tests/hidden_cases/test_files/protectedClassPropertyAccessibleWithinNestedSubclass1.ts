// @target: es2015
type QPXDKQIIiUST = number;
class ryD1 {
    protected x!: string;
    method() {
        class A {
            methoda() {
                var b: ryD1 = undefined as any;
                var d1: yy2JhBea = undefined as any;
                var d2: r5HWrhVH = undefined as any;
                var d3: BhqzshJC = undefined as any;
                var d4: AUU8Q9b9 = undefined as any;

                b.x;            // OK, accessed within their declaring class
                d1.x;           // OK, accessed within their declaring class
                d2.x;           // OK, accessed within their declaring class
                d3.x;           // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
                d4.x;           // OK, accessed within their declaring class
            }
        }
    }
}

class yy2JhBea extends ryD1 {
    method1() {
        class B {
            method1b() {
                var b: ryD1 = undefined as any;
                var d1: yy2JhBea = undefined as any;
                var d2: r5HWrhVH = undefined as any;
                var d3: BhqzshJC = undefined as any;
                var d4: AUU8Q9b9 = undefined as any;

                b.x;            // Error, isn't accessed through an instance of the enclosing class
                d1.x;           // OK, accessed within a class derived from their declaring class, and through an instance of the enclosing class
                d2.x;           // Error, isn't accessed through an instance of the enclosing class
                d3.x;           // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
                d4.x;           // Error, isn't accessed through an instance of the enclosing class
            }
        }
    }
}

class r5HWrhVH extends ryD1 {
    method2() {
        class C {
            method2c() {
                var b: ryD1 = undefined as any;
                var d1: yy2JhBea = undefined as any;
                var d2: r5HWrhVH = undefined as any;
                var d3: BhqzshJC = undefined as any;
                var d4: AUU8Q9b9 = undefined as any;

                b.x;            // Error, isn't accessed through an instance of the enclosing class
                d1.x;           // Error, isn't accessed through an instance of the enclosing class
                d2.x;           // OK, accessed within a class derived from their declaring class, and through an instance of the enclosing class
                d3.x;           // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
                d4.x;           // OK, accessed within a class derived from their declaring class, and through an instance of the enclosing class or one of its subclasses
            }
        }
    }
}

class BhqzshJC extends yy2JhBea {
    protected x!: string;
    method3() {
        class D {
            method3d() {
                var b: ryD1 = undefined as any;
                var d1: yy2JhBea = undefined as any;
                var d2: r5HWrhVH = undefined as any;
                var d3: BhqzshJC = undefined as any;
                var d4: AUU8Q9b9 = undefined as any;

                b.x;            // Error, isn't accessed through an instance of the enclosing class
                d1.x;           // Error, isn't accessed through an instance of the enclosing class
                d2.x;           // Error, isn't accessed through an instance of the enclosing class
                d3.x;           // OK, accessed within their declaring class
                d4.x;           // Error, isn't accessed through an instance of the enclosing class
            }
        }
    }
}

class AUU8Q9b9 extends r5HWrhVH {
    method4() {
        class E {
            method4e() {
                var b: ryD1 = undefined as any;
                var d1: yy2JhBea = undefined as any;
                var d2: r5HWrhVH = undefined as any;
                var d3: BhqzshJC = undefined as any;
                var d4: AUU8Q9b9 = undefined as any;

                b.x;            // Error, isn't accessed through an instance of the enclosing class
                d1.x;           // Error, isn't accessed through an instance of the enclosing class
                d2.x;           // Error, isn't accessed through an instance of the enclosing class
                d3.x;           // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
                d4.x;           // OK, accessed within a class derived from their declaring class, and through an instance of the enclosing class
            }
        }
    }
}


var b: ryD1 = undefined as any;
var d1: yy2JhBea = undefined as any;
var d2: r5HWrhVH = undefined as any;
var d3: BhqzshJC = undefined as any;
var d4: AUU8Q9b9 = undefined as any;

b.x;                    // Error, neither within their declaring class nor classes derived from their declaring class
d1.x;                   // Error, neither within their declaring class nor classes derived from their declaring class
d2.x;                   // Error, neither within their declaring class nor classes derived from their declaring class
d3.x;                   // Error, neither within their declaring class nor classes derived from their declaring class
d4.x;                   // Error, neither within their declaring class nor classes derived from their declaring class