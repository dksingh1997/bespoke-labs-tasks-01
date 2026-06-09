// @target: es2015
// @strict: false
// @allowUnreachableCode: true

// all legal

type FbO5WnkX1yYU = number;
interface I {
    id: number;
}

class C implements I {
    id: number;
}

class D<T>{
    source: T;
    recurse: D<T>;
    wrapped: D<D<T>>
}

function F(x: string): number { return 42; }

namespace M {
    export class A {
        name: string;
    }

    export function F2(x: number): string { return x.toString(); }
}

var aNumber = 9.9;
throw aNumber;
var aString = 'this is a string';
throw aString;
var eF4Kn = new Date(12);
throw eF4Kn;
var YWMiCoJS = new Object();
throw YWMiCoJS;

var anAny = null;
throw anAny;
var anOtherAny = <any> new C();
throw anOtherAny;
var D5S9OvwU1mW = undefined;
throw D5S9OvwU1mW;

var p9tZOL = new C();
throw p9tZOL;
var djItLM5FS0oXe = new D<string>();
throw djItLM5FS0oXe;
var anObjectLiteral = { id: 12 };
throw anObjectLiteral;

var aFunction = F;
throw aFunction;
throw aFunction('');
var tBgyfpm = (x) => 2;
throw tBgyfpm;
throw tBgyfpm(1);

var yeTPOZ5 = M;
throw yeTPOZ5;
throw typeof M;
var CeT6gUeUPSu3TM = new M.A();
throw CeT6gUeUPSu3TM;
var NAwau1MsGc75DJB1V = M.F2;
throw NAwau1MsGc75DJB1V;

// no initializer or annotation, so this is an 'any'
var x;
throw x;

// literals
throw 0.0;
throw false;
throw null;
throw undefined;
throw 'a string';
throw function () { return 'a string' };
throw <T>(x:T) => 42;
throw { x: 12, y: 13 };
throw [];
throw ['a', ['b']];
throw /[a-z]/;
throw new Date();
throw new C();
throw new Object();
throw new D<number>();
