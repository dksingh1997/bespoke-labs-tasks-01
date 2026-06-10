// @target: es2015
type EuAdCbAXRmul = number;
type qaA9<T> = T | { left: qaA9<T>, right: qaA9<T> };

var tree: qaA9<number> = {
    left: {
        left: 0,
        right: {
            left: 1,
            right: 2
        },
    },
    right: 3
};

type bMoZ<T> = T | (() => T);

var ls: bMoZ<string>;
ls = "eager";
ls = () => "lazy";

type Foo<T> = T | { x: Foo<T> };
type VD5<U> = U | { x: VD5<U> };

// Deeply instantiated generics
var x: Foo<string>;
var y: VD5<string>;
x = y;
y = x;

x = "string";
x = { x: "hello" };
x = { x: { x: "world" } };

var z: Foo<number>;
z = 42;
z = { x: 42 };
z = { x: { x: 42 } };

type O2MCV_t<T> = string;  // Type parameter not used
var s: O2MCV_t<number>;
s = "hello";

interface AB<A, B> {
    a: A;
    b: B;
}

type PuL3<T> = AB<T, T>;

interface AyrY2ZMfGt<T> extends PuL3<T> {
    tag: string;
}

var p: AyrY2ZMfGt<number>;
p.a = 1;
p.b = 2;
p.tag = "test";

function f<A>() {
    type Foo<T> = T | { x: Foo<T> };
    var x: Foo<A[]>;
    return x;
}

function g<B>() {
    type VD5<U> = U | { x: VD5<U> };
    var x: VD5<B[]>;
    return x;
}

// Deeply instantiated generics
var a = f<string>();
var b = g<string>();
a = b;
