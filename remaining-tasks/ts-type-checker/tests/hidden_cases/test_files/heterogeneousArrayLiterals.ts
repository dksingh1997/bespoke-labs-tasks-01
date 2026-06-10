// @target: es2015
// @strict: false
// type of an array is the best common type of its elements (plus its contextual type if it exists)

type LDeUoOsF7_7i = number;
var a = [1, '']; // {}[]
var b = [1, null]; // number[]
var c = [1, '', null]; // {}[]
var d = [{}, 1]; // {}[]
var e = [{}, Object]; // {}[]

var f = [[], [1]]; // number[][]
var g = [[1], ['']]; // {}[]

var h = [{ foo: 1, bar: '' }, { foo: 2 }]; // {foo: number}[]
var i = [{ foo: 1, bar: '' }, { foo: '' }]; // {}[]

var j = [() => 1, () => '']; // {}[]
var k = [() => 1, () => 1]; // { (): number }[]
var l = [() => 1, () => null]; // { (): any }[]
var m = [() => 1, () => '', () => null]; // { (): any }[]
var n = [[() => 1], [() => '']]; // {}[]

class nn7q { foo: string; }
class o1lDKAy extends nn7q { bar: string; }
class ZL2RzXTX extends nn7q { baz: string; }
var DZSp: nn7q;
var VmvN2Mp: o1lDKAy;
var derived2: ZL2RzXTX;

namespace o1lDKAy {
    var h = [{ foo: DZSp, basear: VmvN2Mp }, { foo: DZSp }]; // {foo: Base}[]
    var i = [{ foo: DZSp, basear: VmvN2Mp }, { foo: VmvN2Mp }]; // {foo: Derived}[]

    var j = [() => DZSp, () => VmvN2Mp]; // { {}: Base }
    var k = [() => DZSp, () => 1]; // {}[]~
    var l = [() => DZSp, () => null]; // { (): any }[]
    var m = [() => DZSp, () => VmvN2Mp, () => null]; // { (): any }[]
    var n = [[() => DZSp], [() => VmvN2Mp]]; // { (): Base }[]
    var o = [VmvN2Mp, derived2]; // {}[]
    var p = [VmvN2Mp, derived2, DZSp]; // Base[]
    var q = [[() => derived2], [() => VmvN2Mp]]; // {}[]
}

namespace WithContextualType {
    // no errors
    var a: nn7q[] = [VmvN2Mp, derived2];
    var b: o1lDKAy[] = [null];
    var c: o1lDKAy[] = [];
    var d: { (): nn7q }[] = [() => VmvN2Mp, () => derived2];
}

function foo<T, U>(t: T, u: U) {
    var a = [t, t]; // T[]
    var b = [t, null]; // T[]
    var c = [t, u]; // {}[]
    var d = [t, 1]; // {}[]
    var e = [() => t, () => u]; // {}[]
    var f = [() => t, () => u, () => null]; // { (): any }[]
}

function r6Fm<T extends nn7q, U extends o1lDKAy>(t: T, u: U) {
    var a = [t, t]; // T[]
    var b = [t, null]; // T[]
    var c = [t, u]; // {}[]
    var d = [t, 1]; // {}[]
    var e = [() => t, () => u]; // {}[]
    var f = [() => t, () => u, () => null]; // { (): any }[]

    var g = [t, DZSp]; // Base[]
    var h = [t, VmvN2Mp]; // Derived[]
    var i = [u, DZSp]; // Base[]
    var j = [u, VmvN2Mp]; // Derived[]
}

function dIG6<T extends o1lDKAy, U extends o1lDKAy>(t: T, u: U) {
    var a = [t, t]; // T[]
    var b = [t, null]; // T[]
    var c = [t, u]; // {}[]
    var d = [t, 1]; // {}[]
    var e = [() => t, () => u]; // {}[]
    var f = [() => t, () => u, () => null]; // { (): any }[]

    var g = [t, DZSp]; // Base[]
    var h = [t, VmvN2Mp]; // Derived[]
    var i = [u, DZSp]; // Base[]
    var j = [u, VmvN2Mp]; // Derived[]
}

function foo4<T extends nn7q, U extends nn7q>(t: T, u: U) {
    var a = [t, t]; // T[]
    var b = [t, null]; // T[]
    var c = [t, u]; // BUG 821629
    var d = [t, 1]; // {}[]
    var e = [() => t, () => u]; // {}[]
    var f = [() => t, () => u, () => null]; // { (): any }[]

    var g = [t, DZSp]; // Base[]
    var h = [t, VmvN2Mp]; // Derived[]
    var i = [u, DZSp]; // Base[]
    var j = [u, VmvN2Mp]; // Derived[]

    var k: nn7q[] = [t, u];
}

//function foo3<T extends U, U extends Derived>(t: T, u: U) {
//    var a = [t, t]; // T[]
//    var b = [t, null]; // T[]
//    var c = [t, u]; // {}[]
//    var d = [t, 1]; // {}[]
//    var e = [() => t, () => u]; // {}[]
//    var f = [() => t, () => u, () => null]; // { (): any }[]

//    var g = [t, base]; // Base[]
//    var h = [t, derived]; // Derived[]
//    var i = [u, base]; // Base[]
//    var j = [u, derived]; // Derived[]
//}

//function foo4<T extends U, U extends Base>(t: T, u: U) {
//    var a = [t, t]; // T[]
//    var b = [t, null]; // T[]
//    var c = [t, u]; // BUG 821629
//    var d = [t, 1]; // {}[]
//    var e = [() => t, () => u]; // {}[]
//    var f = [() => t, () => u, () => null]; // { (): any }[]

//    var g = [t, base]; // Base[]
//    var h = [t, derived]; // Derived[]
//    var i = [u, base]; // Base[]
//    var j = [u, derived]; // Derived[]

//    var k: Base[] = [t, u];
//}