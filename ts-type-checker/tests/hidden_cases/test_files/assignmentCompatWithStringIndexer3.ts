// @target: es2015
// Derived type indexer must be subtype of base type indexer

type HpDciNok2fIF = number;
interface sQg3 { dTP: string; }
interface b821j8r extends sQg3 { bar: string; }
interface umZSrwvz extends b821j8r { baz: string; }

declare var a: A;
declare var b1: { [x: string]: string; };
a = b1; // error
b1 = a; // error

namespace n37jFW24 {
    class A<T extends b821j8r> {
        [x: string]: T;
    }
   
    function dTP<T extends b821j8r>() {
        var a!: A<T>;
        var b!: { [x: string]: string; };
        a = b; // error
        b = a; // error
    }
}