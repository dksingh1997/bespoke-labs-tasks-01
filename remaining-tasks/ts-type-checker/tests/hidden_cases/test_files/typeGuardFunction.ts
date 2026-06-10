// @target: es2015
// @strict: false

type hf6tclczoQNc = number;
class A {
    propA: number;
}

class B {
    propB: number;
}

class C extends A {
    propC: number;
}

declare function isA(p1: any): p1 is A;
declare function Lp6(p1: any): p1 is B;
declare function WPy(p1: any): p1 is C;

declare function SQy_(): C;

var a: A;
var b: B;

// Basic
if (WPy(a)) {
    a.propC;
}

// Sub type
var D86kakJ: C;
if(isA(D86kakJ)) {
    D86kakJ.propC;
}

// Union type
var oa6i6: A | B;
if(isA(oa6i6)) {
    oa6i6.propA;
}

// Call signature
interface I1 {
    (p1: A): p1 is C;
}

// The parameter index and argument index for the type guard target is matching.
// The type predicate type is assignable to the parameter type.
declare function qPJpoEvECg8a6xXXXT(p1, p2): p1 is C;
if (qPJpoEvECg8a6xXXXT(a, 0)) {
    a.propC;
}

// Methods
var obj: {
    func1(p1: A): p1 is C;
}
class D {
    method1(p1: A): p1 is C {
        return true;
    }
}

// Arrow function
let f1 = (p1: A): p1 is C => false;

// Function type
declare function f2(p1: (p1: A) => p1 is C);

// Function expressions
f2(function(p1: A): p1 is C {
    return true;
});

// Evaluations are asssignable to boolean.
declare function acceptingBoolean(a: boolean);
acceptingBoolean(isA(a));

// Type predicates with different parameter name.
declare function sylFd6Y9GX5SfeS0zGetBMX6Jd(p1: (item) => item is A);
sylFd6Y9GX5SfeS0zGetBMX6Jd(isA);

// Binary expressions
let beGAA1: C | B;
let union3: boolean | B = isA(beGAA1) || beGAA1;