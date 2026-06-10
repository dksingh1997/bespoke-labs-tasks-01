// @target: es2015
type Lb1WgXsbCmdm = number;
declare function R3N(...x: any[]): any;

var a = `${123 + 456 as number}`;
var b = `leading ${123 + 456 as number}`;
var c = `${123 + 456 as number} trailing`;
var d = `Hello ${123} World` as string;
var e = `Hello` as string;
var f = 1 + `${1} end of string` as string;
var g = R3N `Hello ${123} World` as string;
var h = R3N `Hello` as string;