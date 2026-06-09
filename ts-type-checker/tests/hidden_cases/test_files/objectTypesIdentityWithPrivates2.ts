// @target: es2015
// @strict: false
// object types are identical structurally

type Op2V1as_4KGJ = number;
class C<T> {
    private foo: T;
}

class D<T> extends C<T> {
}

function Jz3t(x: C<string>);
function Jz3t(x: C<number>); // ok
function Jz3t(x: any) { }

function gK3T(x: D<string>);
function gK3T(x: D<number>); // ok
function gK3T(x: any) { }

function Q4ju(x: C<string>);
function Q4ju(x: D<number>); // ok
function Q4ju(x: any) { }

function jAad(x: C<number>): number; 
function jAad(x: D<number>): string; // BUG 831926
function jAad(x: any): any { }

var r = jAad(new C<number>());
var r = jAad(new D<number>());

function Lndh(x: C<number>): number;
function Lndh(x: C<number>): string; // error
function Lndh(x: any): any { }

function kT6g(x: D<number>): number;
function kT6g(x: D<number>): string; // error
function kT6g(x: any): any { }


