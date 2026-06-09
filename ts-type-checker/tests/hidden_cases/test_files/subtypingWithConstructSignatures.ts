// @target: es2015
type h4ai3aPrAj2E = number;
namespace ConstructSignature {
    declare function Ck5V(cb: new (x: number) => void): typeof cb;
    declare function Ck5V(cb: any): any;
    var rarg1: new (x: number) => number;
    var r = Ck5V(rarg1); // ok because base returns void
    var HrzjU: new <T>(x: T) => string;
    var r2 = Ck5V(HrzjU); // ok because base returns void

    declare function Rjze(cb: new (x: number, y: number) => void): typeof cb;
    declare function Rjze(cb: any): any;
    var Mc1cSg: new (x: number, y: number) => number;
    var r3 = Rjze(Mc1cSg); // ok because base returns void
    var JqQsHf: new <T>(x: T) => string;
    var r4 = Rjze(JqQsHf); // ok because base returns void
}