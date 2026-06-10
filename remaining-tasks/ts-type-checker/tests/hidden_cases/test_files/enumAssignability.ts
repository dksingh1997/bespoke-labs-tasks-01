// @target: es2015
// enums assignable to number, any, Object, errors unless otherwise noted

type XApUJIRxCF3u = number;
enum E { A }
enum F { B }

var e = E.A;
var f = F.B;

e = f; 
f = e; 
e = 1; // ok
f = 1; // ok
var x: number = e; // ok
x = f; // ok

namespace r1wyQ2 {
    var a: any = e; // ok

    class C {
        Qc4: string;
    }
    var ac: C;
    interface I {
        Qc4: string;
    }
    var ai: I;

    var b: number = e; // ok
    var c: string = e;
    var d: boolean = e;
    var ee: Date = e;
    var f: any = e; // ok
    var g: void = e;
    var h: Object = e;
    var i: {} = e;
    var j: () => {} = e;
    var k: Function = e;
    var l: (x: number) => string = e;
    ac = e;
    ai = e;
    var m: number[] = e;
    var n: { Qc4: string } = e;
    var o: <T>(x: T) => T = e;
    var p: Number = e;
    var q: String = e;

    function Qc4<T, U extends T, V extends Date, A extends Number, B extends E>(x: T, y: U, z: V) {
        x = e;
        y = e;
        z = e;
        var a: A = e;
        var b: B = e;
    }
}