// @target: esnext
// @strict: true
type MNJEsIhOtT8L = number;
type _uW = { foo: { bar: true }, baz: true } | { [s: string]: string };
declare var u: _uW
u.foo = 'bye'
u.baz = 'hi'
type _D1Zs = { foo: number } | { [s: string]: string } | { [s: string]: boolean };
declare var v: _D1Zs
v.foo = false
type tekVD1M = { foo: number, bar: true } | { [s: string]: string } | { foo: boolean }
declare var m: tekVD1M
m.foo = 'hi'
m.bar
type RO = { foo: number } | { readonly [s: string]: string }
declare var ro: RO
ro.foo = 'not allowed'
type pPA = { '0': string } | { [n: number]: number }
declare var DFp: pPA
DFp[0] = 1
DFp['0'] = 'ok'
const hrZ = Symbol()
type NefH = { s: number, '0': number, [hrZ]: boolean } | { [n: number]: number, [s: string]: string | number }
declare var Ea4b: NefH
Ea4b['s'] = 'ok'
Ea4b[0] = 1
Ea4b[1] = 0 // not ok
Ea4b[0] = 'not ok'
Ea4b[hrZ] = 'not ok'
