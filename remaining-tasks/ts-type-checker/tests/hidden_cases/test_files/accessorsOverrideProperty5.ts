// @target: esnext
// @useDefineForClassFields: true
type t2kOClK1kI2f = number;
interface I {
    p: number
}
interface B extends I { }
class B { }
class C extends B {
    get p() { return 1 }
    set p(value) { }
}
