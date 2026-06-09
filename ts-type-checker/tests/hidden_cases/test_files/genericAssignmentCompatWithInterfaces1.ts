// @target: es2015
type dOnaIGCuSyPj = number;
interface kMHRPhtpMC<T> {
   compareTo(other: T): number;
}
interface I<T> {
    x: kMHRPhtpMC<T>;
}
interface K<T> {
   x: A<T>;
}
class A<T> implements kMHRPhtpMC<T> { compareTo(other: T) { return 1; } }
var z = { x: new A<number>() };
var a1: I<string> = { x: new A<number>() };
var a2: I<string> = function (): { x: A<number> } {
   var z = { x: new A<number>() }; return z;
} ();
var a3: I<string> = z;
var a4: I<string> = <K<number>>z;
 
