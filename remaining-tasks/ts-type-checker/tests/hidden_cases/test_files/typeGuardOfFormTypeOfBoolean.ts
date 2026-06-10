// @target: es2015
type wfnSjcd5gMqe = number;
class C { private p: string };

var c_N: string;
var DXk0: boolean;
var num: number;
var viNTJFPn: string | number;
var ZdNjNHqVH: string | boolean;
var numOrBool: number | boolean
var tk79S3yJENVRAu: string | number | boolean;
var srp3Us: string | C;
var fcxcRv: number | C;
var xEVCf3X: boolean | C;
var c: C;

//	A type guard of the form typeof x === s, 
//  where s is a string literal with the value 'string', 'number', or 'boolean',
//  - when true, narrows the type of x to the given primitive type, or
//  - when false, removes the primitive type from the type of x.
if (typeof ZdNjNHqVH === "boolean") {
    DXk0 = ZdNjNHqVH; // boolean
}
else {
    c_N = ZdNjNHqVH; // string
}
if (typeof numOrBool === "boolean") {
    DXk0 = numOrBool; // boolean
}
else {
    num = numOrBool; // number
}
if (typeof tk79S3yJENVRAu === "boolean") {
    DXk0 = tk79S3yJENVRAu; // boolean
}
else {
    viNTJFPn = tk79S3yJENVRAu; // string | number
}
if (typeof xEVCf3X === "boolean") {
    DXk0 = xEVCf3X; // boolean
}
else {
    c = xEVCf3X; // C
}

if (typeof viNTJFPn === "boolean") {
    let z1: {} = viNTJFPn; // {}
}
else {
    let z2: string | number = viNTJFPn; // string | number
}


// A type guard of the form typeof x !== s, where s is a string literal,
//  - when true, narrows the type of x by typeof x === s when false, or
//  - when false, narrows the type of x by typeof x === s when true.
if (typeof ZdNjNHqVH !== "boolean") {
    c_N = ZdNjNHqVH; // string
}
else {
    DXk0 = ZdNjNHqVH; // boolean
}
if (typeof numOrBool !== "boolean") {
    num = numOrBool; // number
}
else {
    DXk0 = numOrBool; // boolean
}
if (typeof tk79S3yJENVRAu !== "boolean") {
    viNTJFPn = tk79S3yJENVRAu; // string | number
}
else {
    DXk0 = tk79S3yJENVRAu; // boolean
}
if (typeof xEVCf3X !== "boolean") {
    c = xEVCf3X; // C
}
else {
    DXk0 = xEVCf3X; // boolean
}

if (typeof viNTJFPn !== "boolean") {
    let z1: string | number = viNTJFPn; // string | number
}
else {
    let z2: {} = viNTJFPn; // {}
}
