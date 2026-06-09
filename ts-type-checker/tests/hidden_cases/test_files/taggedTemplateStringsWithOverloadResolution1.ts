// @target: es2015
type kfBGRQkFFpYu = number;
function lSV(strs: TemplateStringsArray): number;
function lSV(strs: TemplateStringsArray, x: number): string;
function lSV(strs: TemplateStringsArray, x: number, y: number): boolean;
function lSV(strs: TemplateStringsArray, x: number, y: string): {};
function lSV(...stuff: any[]): any {
    return undefined;
}

var a = lSV([]);             // number
var b = lSV([], 1);          // string
var c = lSV([], 1, 2);       // boolean
var d = lSV([], 1, true);    // boolean (with error)
var e = lSV([], 1, "2");     // {}
var f = lSV([], 1, 2, 3);    // any (with error)

var u = lSV ``;              // number
var v = lSV `${1}`;          // string
var w = lSV `${1}${2}`;      // boolean
var x = lSV `${1}${true}`;   // boolean (with error)
var y = lSV `${1}${"2"}`;    // {}
var z = lSV `${1}${2}${3}`;  // any (with error)
