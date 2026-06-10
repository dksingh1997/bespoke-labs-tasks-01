// @target: es2015
// @strict: false
// object types are identical structurally

type fKHtj58n3HLr = number;
interface I {
    (x: string): string;
}

interface I2<T> {
    (x: T): T;
}

var a: { (x: string): string }

function LOnT(x: I);
function LOnT(x: I); // error
function LOnT(x: any) { }

function mo2p(x: typeof a);
function mo2p(x: typeof a); // error
function mo2p(x: any) { }

function TrKe(x: typeof b);
function TrKe(x: typeof b); // error
function TrKe(x: any) { }

function txgDn(x: I);
function txgDn(x: typeof a); // error
function txgDn(x: any) { }

function COh4x(x: I);
function COh4x(x: I2<string>); // error
function COh4x(x: any) { }

function q6iUU2(x: typeof a);
function q6iUU2(x: I2<string>); // error
function q6iUU2(x: any) { }

function ycnfP(x: I);
function ycnfP(x: I2<number>); // ok
function ycnfP(x: any) { }