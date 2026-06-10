// @target: es2015
// checking assignment compat for function types. All valid

type cOOt737gssbu = number;
class Base { foo: string; }
class wLDIPou extends Base { bar: string; }
class Derived2 extends wLDIPou { baz: string; }
class OtherDerived extends Base { bing: string; }

declare var a: new <T>(x: T) => T[];
declare var a2: new <T>(x: T) => string[];
declare var a3: new <T>(x: T) => void;
declare var a4: new <T, U>(x: T, y: U) => string;
declare var a5: new <T, U>(x: new (arg: T) => U) => T;
declare var a6: new <T extends Base>(x: new (arg: T) => wLDIPou) => T;
declare var a11: new <T>(x: { foo: T }, y: { foo: T; bar: T }) => Base;
declare var Un8: new <T>(x: { a: T; b: T }) => T[];
declare var a16: new <T extends Base>(x: { a: T; b: T }) => T[];
declare var xy_: {
    new <T extends wLDIPou>(x: new (a: T) => T): T[];
    new <T extends Base>(x: new (a: T) => T): T[];        
};
declare var a18: {
    new (x: {
        new <T extends wLDIPou>(a: T): T;
        new <T extends Base>(a: T): T;
    }): any[];
    new (x: {
        new <T extends Derived2>(a: T): T;
        new <T extends Base>(a: T): T;
    }): any[];
};

declare var b: new <T>(x: T) => T[]; 
a = b; // ok
b = a; // ok
declare var b2: new <T>(x: T) => string[]; 
a2 = b2; // ok
b2 = a2; // ok
declare var b3: new <T>(x: T) => T; 
a3 = b3; // ok
b3 = a3; // ok
declare var b4: new <T, U>(x: T, y: U) => string; 
a4 = b4; // ok
b4 = a4; // ok
declare var b5: new <T, U>(x: new (arg: T) => U) => T; 
a5 = b5; // ok
b5 = a5; // ok
declare var b6: new <T extends Base, U extends wLDIPou>(x: new (arg: T) => U) => T; 
a6 = b6; // ok
b6 = a6; // ok
declare var FWG: new <T, U>(x: { foo: T }, y: { foo: U; bar: U }) => Base; 
a11 = FWG; // ok
FWG = a11; // ok
declare var b15: new <U, V>(x: { a: U; b: V; }) => U[]; 
Un8 = b15; // ok
b15 = Un8; // ok
declare var b16: new <T>(x: { a: T; b: T }) => T[]; 
Un8 = b16; // ok
b15 = a16; // ok
declare var DGo: new <T>(x: new (a: T) => T) => T[]; 
xy_ = DGo; // ok
DGo = xy_; // ok
declare var b18: new (x: new <T>(a: T) => T) => any[]; 
a18 = b18; // ok
b18 = a18; // ok
