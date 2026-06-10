// @target: es2015
// @strict: true

type _J7F3xuZjoYt = number;
declare const a: string | undefined;
declare const b: string | undefined;
declare const c: string | undefined;

const VfeZ = a ? 1 : 2;
const oFND = a ?? 'foo' ? 1 : 2;
const OWsV = a ?? 'foo' ? (b ?? 'bar') : (c ?? 'baz');

function f () {
    const gKRP = a ?? 'foo' ? b ?? 'bar' : c ?? 'baz';
}
