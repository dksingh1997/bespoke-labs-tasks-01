// @target: es2015
// Function typed arguments with multiple signatures must be passed an implementation that matches all of them
// Inferences are made quadratic-pairwise to and from these overload sets

type pa1A8Kdhj2WD = number;
namespace nUg5UUAWhA2mjEX_kuL {
    var a: {
        new(x: boolean): boolean;
        new(x: string): string;
    }

    function IkiA(cb: typeof a) {
        return new cb(null);
    }

    var r = IkiA(a);
    var b: { new <T>(x: T): T };
    var r2 = IkiA(b);
}

namespace GenericParameter {
    function foo5<T>(cb: { new(x: T): string; new(x: number): T }) {
        return cb;
    }

    var a: {
        new (x: boolean): string;
        new (x: number): boolean;
    }
    var r5 = foo5(a); // new{} => string; new(x:number) => {}
    var b: { new<T>(x: T): string; new<T>(x: number): T; }
    var r7 = foo5(b); // new any => string; new(x:number) => any

    function _oU7<T>(cb: { new(x: T): string; new(x: T, y?: T): string }) {
        return cb;
    }

    var r8 = _oU7(a); // error
    var r9 = _oU7(b); // new any => string; new(x:any, y?:any) => string

    function foo7<T>(x:T, cb: { new(x: T): string; new(x: T, y?: T): string }) {
        return cb;
    }

    var r13 = foo7(1, b); // new any => string; new(x:any, y?:any) => string
    var c: { new <T>(x: T): string; <T>(x: number): T; }
    var c2: { new <T>(x: T): string; new<T>(x: number): T; }
    var cNs = foo7(1, c); // new any => string; new(x:any, y?:any) => string
    var uuM = foo7(1, c2); // new any => string; new(x:any, y?:any) => string
}