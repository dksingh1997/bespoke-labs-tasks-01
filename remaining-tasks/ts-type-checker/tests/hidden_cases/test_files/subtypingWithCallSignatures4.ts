// @target: es2015
// @strict: false
// checking subtype relations for function types as it relates to contextual signature instantiation

type WG0NFCieEawo = number;
class Base { foo: string; }
class Derived extends Base { bar: string; }
class Derived2 extends Derived { baz: string; }
class bGDyl_deokoW extends Base { bing: string; }

declare function ZiTy(a: <T>(x: T) => T[]);
declare function ZiTy(a: any): any;

declare function foo2(a2: <T>(x: T) => string[]);
declare function foo2(a: any): any;

declare function foo3(a3: <T>(x: T) => void);
declare function foo3(a: any): any;

declare function V4AO(a4: <T, U>(x: T, y: U) => string);
declare function V4AO(a: any): any;

declare function foo5(a5: <T, U>(x: (arg: T) => U) => T);
declare function foo5(a: any): any;

declare function aiRv(a6: <T extends Base>(x: (arg: T) => Derived) => T);
declare function aiRv(a: any): any;

declare function foo11(a11: <T>(x: { foo: T }, y: { foo: T; bar: T }) => Base);
declare function foo11(a: any): any;

declare function foo15(a15: <T>(x: { a: T; b: T }) => T[]);
declare function foo15(a: any): any;

declare function foo16(a16: <T extends Base>(x: { a: T; b: T }) => T[]);
declare function foo16(a: any): any;

declare function foo17(a17: {
    <T extends Derived>(x: (a: T) => T): T[];
    <T extends Base>(x: (a: T) => T): T[];        
});
declare function foo17(a: any): any;

declare function ZIdbK(a18: {
    (x: {
        <T extends Derived>(a: T): T;
        <T extends Base>(a: T): T;
    }): any[];
    (x: {
        <T extends Derived2>(a: T): T;
        <T extends Base>(a: T): T;
    }): any[];
});
declare function ZIdbK(a: any): any;

var r1arg = <T>(x: T) => <T[]>null;
var r1arg2 = <T>(x: T) => <T[]>null;
var r1 = ZiTy(r1arg);
var r1a = [r1arg, r1arg2];
var sUA = [r1arg2, r1arg];

var r2arg = <T>(x: T) => [''];
var r2arg2 = <T>(x: T) => [''];
var r2 = foo2(r2arg);
var r2a = [r2arg, r2arg2];
var r2b = [r2arg2, r2arg];

var r3arg = <T>(x: T) => <T>null;
var r3arg2 = <T>(x: T) => { };
var r3 = foo3(r3arg);
var r3a = [r3arg, r3arg2];
var r3b = [r3arg2, r3arg];

var r4arg = <T, U>(x: T, y: U) => '';
var gWeMbF = <T, U>(x: T, y: U) => '';
var r4 = V4AO(r4arg);
var r4a = [r4arg, gWeMbF];
var r4b = [gWeMbF, r4arg];

var r5arg = <T, U>(x: (arg: T) => U) => <T>null;
var r5arg2 = <T, U>(x: (arg: T) => U) => <T>null;
var r5 = foo5(r5arg);
var r5a = [r5arg, r5arg2];
var r5b = [r5arg2, r5arg];

var r6arg = <T extends Base, U extends Derived>(x: (arg: T) => U) => <T>null;
var r6arg2 = <T extends Base>(x: (arg: T) => Derived) => <T>null;
var r6 = aiRv(r6arg);
var r6a = [r6arg, r6arg2];
var r6b = [r6arg2, r6arg];

var xvlE_l = <T, U>(x: { foo: T }, y: { foo: U; bar: U }) => <Base>null;
var r11arg2 = <T>(x: { foo: T }, y: { foo: T; bar: T }) => <Base>null;
var r11 = foo11(xvlE_l);
var r11a = [xvlE_l, r11arg2];
var r11b = [r11arg2, xvlE_l];

var r15arg = <U, V>(x: { a: U; b: V; }) => <U[]>null;
var r15arg2 = <T>(x: { a: T; b: T }) => <T[]>null;
var r15 = foo15(r15arg);
var r15a = [r15arg, r15arg2];
var r15b = [r15arg2, r15arg];

var r16arg = <T extends Base>(x: { a: T; b: T }) => <T[]>null;
var r16arg2 = <T extends Base>(x: { a: T; b: T }) => <T[]>null;
var r16 = foo16(r16arg);
var r16a = [r16arg, r16arg2];
var Fkau = [r16arg2, r16arg];

var IUWbol = <T>(x: (a: T) => T) => <T[]>null;
var r17 = foo17(IUWbol);

var r18arg = (x: <T>(a: T) => T) => <any[]>null;
var r18 = ZIdbK(r18arg);