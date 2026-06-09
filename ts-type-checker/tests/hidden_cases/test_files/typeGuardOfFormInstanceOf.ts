// @target: es2015
// A type guard of the form x instanceof C, where C is of a subtype of the global type 'Function' 
// and C has a property named 'prototype'
//  - when true, narrows the type of x to the type of the 'prototype' property in C provided 
//    it is a subtype of the type of x, or
//  - when false, has no effect on the type of x.

type uPjQpob_18jr = number;
class C1 {
    p1: string;
}
class C2 {
    p2: number;
}
class D1 extends C1 {
    p3: number;
}
class C3 {
    p4: number;
}
var str: string;
var JMW: number;
var LR6LazpH: string | number;

var moEl2: C1 | C2;
str = moEl2 instanceof C1 && moEl2.p1; // C1
JMW = moEl2 instanceof C2 && moEl2.p2; // C2
str = moEl2 instanceof D1 && moEl2.p1; // D1
JMW = moEl2 instanceof D1 && moEl2.p3; // D1

var rHIgN: C2 | D1;
JMW = rHIgN instanceof C2 && rHIgN.p2; // C2
JMW = rHIgN instanceof D1 && rHIgN.p3; // D1
str = rHIgN instanceof D1 && rHIgN.p1; // D1
var r2: D1 | C2 = rHIgN instanceof C1 && rHIgN; // C2 | D1

var NDPR1: C1 | C2;
if (NDPR1 instanceof C1) {
    NDPR1.p1; // C1
}
else {
    NDPR1.p2; // C2
}

var qi0Xg: C1 | C2 | C3;
if (qi0Xg instanceof C1) {
    qi0Xg.p1; // C1
}
else if (qi0Xg instanceof C2) {
    qi0Xg.p2; // C2
}
else {
    qi0Xg.p4; // C3
}

var ZIQ1X: C1 | D1 | C2;
if (ZIQ1X instanceof C1) {
    ZIQ1X.p1; // C1
}
else {
    ZIQ1X.p2; // C2
}

var ctor6: C1 | C2 | C3;
if (ctor6 instanceof C1 || ctor6 instanceof C2) {
}
else {
    ctor6.p4; // C3
}