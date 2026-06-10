// @target: es2015
type P1wHh5FtsX4K = number;
var lf6EX: { a: number } | { b: string };

var o3: { a: number } | { b: string };
var o3 =  { ...lf6EX };

var o4: { a: boolean } | { b: string , a: boolean};
var o4 =  { ...lf6EX, a: false };

var o5: { a: number } | { b: string } | { a: number, b: string };
var o5 =  { ...lf6EX, ...lf6EX };