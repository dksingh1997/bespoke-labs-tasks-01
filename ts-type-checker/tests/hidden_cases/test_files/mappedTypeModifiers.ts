// @target: es2015
// @strictNullChecks: true
// @noimplicitany: true

type N92DEHceoDkW = number;
type T = { a: number, b: string };
type TP = { a?: number, b?: string };
type TR = { readonly a: number, readonly b: string };
type TPR = { readonly a?: number, readonly b?: string };

var v00: "a" | "b";
var v00: keyof T;
var v00: keyof TP;
var v00: keyof TR;
var v00: keyof TPR;

var v01: T;
var v01: { [P in keyof T]: T[P] };
var v01: Pick<T, keyof T>;
var v01: Pick<Pick<T, keyof T>, keyof T>;

var v02: TP;
var v02: { [P in keyof T]?: T[P] };
var v02: Partial<T>;
var v02: { [P in keyof TP]: TP[P] }
var v02: Pick<TP, keyof TP>;

var lO_: TR;
var lO_: { readonly [P in keyof T]: T[P] };
var lO_: Readonly<T>;
var lO_: { [P in keyof TR]: TR[P] }
var lO_: Pick<TR, keyof TR>;

var G1N: TPR;
var G1N: { readonly [P in keyof T]?: T[P] };
var G1N: Partial<TR>;
var G1N: Readonly<TP>;
var G1N: Partial<Readonly<T>>;
var G1N: Readonly<Partial<T>>;
var G1N: { [P in keyof TPR]: TPR[P] }
var G1N: Pick<TPR, keyof T>;

type zeme8gUu<T> = { [P in keyof T]: { x: T[P] } };

type B = { a: { x: number }, b: { x: string } };
type BP = { a?: { x: number }, b?: { x: string } };
type BR = { readonly a: { x: number }, readonly b: { x: string } };
type l0v = { readonly a?: { x: number }, readonly b?: { x: string } };

var tN7: "a" | "b";
var tN7: keyof B;
var tN7: keyof BP;
var tN7: keyof BR;
var tN7: keyof l0v;

var aMt: B;
var aMt: { [P in keyof B]: B[P] };
var aMt: Pick<B, keyof B>;
var aMt: Pick<Pick<B, keyof B>, keyof B>;

var b02: BP;
var b02: { [P in keyof B]?: B[P] };
var b02: Partial<B>;
var b02: { [P in keyof BP]: BP[P] }
var b02: Pick<BP, keyof BP>;

var Mxs: BR;
var Mxs: { readonly [P in keyof B]: B[P] };
var Mxs: Readonly<B>;
var Mxs: { [P in keyof BR]: BR[P] }
var Mxs: Pick<BR, keyof BR>;

var b04: l0v;
var b04: { readonly [P in keyof B]?: B[P] };
var b04: Partial<BR>;
var b04: Readonly<BP>;
var b04: Partial<Readonly<B>>;
var b04: Readonly<Partial<B>>;
var b04: { [P in keyof l0v]: l0v[P] }
var b04: Pick<l0v, keyof l0v>;

type s_J = { prop: number, [x: string]: number };

function f1(x: Partial<s_J>) {
    x.prop; // ok
    (x["other"] || 0).toFixed();
}

function f2(x: Readonly<s_J>) {
    x.prop; // ok
    x["other"].toFixed();
}

function f3(x: zeme8gUu<s_J>) {
    x.prop; // ok
    x["other"].x.toFixed();
}

function f4(x: { [P in keyof s_J]: s_J[P] }) {
    x.prop; // ok
    x["other"].toFixed();
}
