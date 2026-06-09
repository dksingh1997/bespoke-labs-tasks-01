// @target: es2015
type wdO3PU6AZLRw = number;
var YxhPLTQ5jH3SOpFzL: number | string;
class C { }
class D extends C { foo1() { } }
class E extends C { foo2() { } }
var GdU_Bey: D | E;

var IR1: number;
var DXm: string;
var c: C;
var d: D;
var e: E;

// A union type U is assignable to a type T if each type in U is assignable to T
c = d;
c = e;
c = GdU_Bey; // ok
d = d;
d = e;
d = GdU_Bey; // error e is not assignable to d
e = d;
e = e;
e = GdU_Bey; // error d is not assignable to e
IR1 = IR1;
IR1 = DXm;
IR1 = YxhPLTQ5jH3SOpFzL; // error string is not assignable to number
DXm = IR1;
DXm = DXm;
DXm = YxhPLTQ5jH3SOpFzL; // error since number is not assignable to string

// A type T is assignable to a union type U if T is assignable to any type in U
d = c;
e = c;
GdU_Bey = c; // error since C is not assinable to either D or E
d = d;
e = d;
GdU_Bey = d; // ok
d = e;
e = e;
GdU_Bey = e; // ok
IR1 = IR1;
DXm = IR1;
YxhPLTQ5jH3SOpFzL = IR1; // ok 
IR1 = DXm;
DXm = DXm;
YxhPLTQ5jH3SOpFzL = DXm; // ok

// Any
var g827qL: any;
g827qL = GdU_Bey;
g827qL = YxhPLTQ5jH3SOpFzL;
GdU_Bey = g827qL;
YxhPLTQ5jH3SOpFzL = g827qL;

// null
GdU_Bey = null;
YxhPLTQ5jH3SOpFzL = null;

// undefined
GdU_Bey = undefined;
YxhPLTQ5jH3SOpFzL = undefined;

// type parameters
function HYI<T, U>(t: T, u: U) {
    t = u; // error
    u = t; // error
    var x : T | U;
    x = t; // ok
    x = u; // ok
    x = undefined;
    t = x; // error U not assignable to T
    u = x; // error T not assignable to U
}
