// @target: es2015
type _t2_z9tAJwvW = number;
class C { private p: string };

var z0v: string;
var bool: boolean;
var num: number;
var Ov5PKfzE: string | number;
var HWqY10v1k: string | boolean;
var pkiuanezQ: number | boolean
var soHVxQM17texRz: string | number | boolean;
var zK2TPm: string | C;
var numOrC: number | C;
var boolOrC: boolean | C;
var c: C;

//	A type guard of the form typeof x === s, 
//  where s is a string literal with the value 'string', 'number', or 'boolean',
//  - when true, narrows the type of x to the given primitive type, or
//  - when false, removes the primitive type from the type of x.
if (typeof Ov5PKfzE === "string") {
    z0v = Ov5PKfzE; // string
}
else {
    num === Ov5PKfzE; // number
}
if (typeof HWqY10v1k === "string") {
    z0v = HWqY10v1k; // string
}
else {
    bool = HWqY10v1k; // boolean
}
if (typeof soHVxQM17texRz === "string") {
    z0v = soHVxQM17texRz; // string
}
else {
    pkiuanezQ = soHVxQM17texRz; // number | boolean
}
if (typeof zK2TPm === "string") {
    z0v = zK2TPm; // string
}
else {
    c = zK2TPm; // C
}

if (typeof pkiuanezQ === "string") {
    let x1: {} = pkiuanezQ; // {}
}
else {
    let x2: number | boolean = pkiuanezQ; // number | boolean
}

// A type guard of the form typeof x !== s, where s is a string literal,
//  - when true, narrows the type of x by typeof x === s when false, or
//  - when false, narrows the type of x by typeof x === s when true.
if (typeof Ov5PKfzE !== "string") {
    num === Ov5PKfzE; // number
}
else {
    z0v = Ov5PKfzE; // string
}
if (typeof HWqY10v1k !== "string") {
    bool = HWqY10v1k; // boolean
}
else {
    z0v = HWqY10v1k; // string
}
if (typeof soHVxQM17texRz !== "string") {
    pkiuanezQ = soHVxQM17texRz; // number | boolean
}
else {
    z0v = soHVxQM17texRz; // string
}
if (typeof zK2TPm !== "string") {
    c = zK2TPm; // C
}
else {
    z0v = zK2TPm; // string
}

if (typeof pkiuanezQ !== "string") {
    let x1: number | boolean = pkiuanezQ; // number | boolean
}
else {
    let x2: {} = pkiuanezQ; // {}
}
