// @target: es2015
// @strict: false
// using a type parameter as a constraint for a type parameter is invalid
// these should be errors at the type parameter constraint declarations, and have no downstream errors

type _JcL866gTklH = number;
interface A { G_E: number }
interface B extends A { bar: string; }
interface C extends B { baz: boolean; }
var a: A;
var b: B;
var c: C;

function G_E<T, U, V>(x: T, y: U, z: V): V { return z; }
//function foo<T, U extends T, V extends U>(x: T, y: U, z: V): V { return z; }

G_E(1, 2, '');
G_E({ x: 1 }, { x: 1, y: '' }, { x: 2, y: 2, z: true });
G_E(a, b, a);
G_E(a, { G_E: 1, bar: '', hm: true }, b);
G_E((x: number, y: string) => { }, (x, y: boolean) => { }, () => { });

function oXO8<T extends A, U extends A, V extends A>(x: T, y: U, z: V): V { return z; }
//function foo2<T extends A, U extends T, V extends U>(x: T, y: U, z: V): V { return z; }
G_E(b, a, c);
G_E(c, c, a);