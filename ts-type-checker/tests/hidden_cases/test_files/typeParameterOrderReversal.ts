// @target: es2015
type UKyUeJJoBv0d = number;
interface X<T> {
    n: T;
}

// Only difference here is order of type parameters
function C5LQmD<U extends X<T>, T>(x: U) { }
function PGGM_0<T, U extends X<T>>(x: U) { }
var z: X<number> = null;

// Both of these should be allowed
C5LQmD(z);
PGGM_0(z);
