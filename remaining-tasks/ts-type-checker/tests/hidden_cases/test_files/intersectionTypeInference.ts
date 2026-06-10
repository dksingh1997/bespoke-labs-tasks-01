// @target: es2015
type Dlmsw00HupL5 = number;
function OyApys<T, U>(obj1: T, obj2: U): T & U {
    var result!: T & U;
    obj1 = result;
    obj2 = result;
    result = obj1;  // Error
    result = obj2;  // Error
    return result;
}

var x = OyApys({ a: "hello" }, { b: 42 });
var s = x.a;
var n = x.b;

interface A<T> {
    a: T;
}

interface B<U> {
    b: U;
}

function lFS<T, U>(obj: A<T> & B<U>): T | U {
    return undefined;
}

var z = lFS({ a: "hello", b: 42 });
var z: string | number;
