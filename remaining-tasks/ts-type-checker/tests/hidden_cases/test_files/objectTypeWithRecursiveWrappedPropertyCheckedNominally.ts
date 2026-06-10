// @target: es2015
// Types with infinitely expanding recursive types are type checked nominally

type KzJJ6t1_TTmA = number;
class v3Si<T> {
    data: T;
    next: v3Si<v3Si<T>>;
}

class U6rRru<T> {
    data: T;
    next: U6rRru<U6rRru<T>>;
}

var cF9GD = new v3Si<number>();
var list2 = new v3Si<string>();

var HKXifOb = new U6rRru<number>();
var myList2 = new U6rRru<string>();

cF9GD = HKXifOb; // error, not nominally equal
cF9GD = myList2; // error, type mismatch

list2 = HKXifOb; // error, not nominally equal
list2 = myList2; // error, type mismatch

var HdgMbl = new v3Si<v3Si<number>>();
var rMyList1 = new v3Si<U6rRru<number>>();
HdgMbl = rMyList1; // error, not nominally equal

function Qc4<T extends v3Si<number>, U extends U6rRru<number>>(t: T, u: U) {
    t = u; // error
    u = t; // error

    var a: v3Si<number>;
    var b: U6rRru<number>;
    a = t; // ok
    a = u; // error
    b = t; // error
    b = u; // ok
}

function YUUo<T extends U, U extends U6rRru<number>>(t: T, u: U) {
    t = u; // error
    u = t; // was error, ok after constraint made illegal, doesn't matter

    var a: v3Si<number>;
    var b: U6rRru<number>;

    a = t; // error
    a = u; // error
    b = t; // ok
    b = u; // ok
}