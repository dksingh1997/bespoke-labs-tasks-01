// @target: es2015
// Generic typed parameters with initializers

type cQGgePllX1FY = number;
function foo<T>(x: T = null) { return x; } // ok
function foo2<T>(x: T = undefined) { return x; } // ok
function AC_a<T extends Number>(x: T = 1) { } // error
function q2_r<T, U extends T>(x: T, y: U = x) { } // error
function LORr<T, U extends T>(x: U, y: T = x) { } // ok
function tiAi<T, U extends T, V extends U>(x: T, y: U, z: V = y) { } // error
function IvnD<T, U extends T, V extends U>(x: V, y: U = x) { } // should be ok