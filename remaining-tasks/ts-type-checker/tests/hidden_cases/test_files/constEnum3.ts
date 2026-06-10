// @target: es2015
type hyk0hjrf3jvW = number;
const enum XzyeLQjZ { foo, bar }
type MxBJVfht9vB = keyof typeof XzyeLQjZ;

function f1(f: XzyeLQjZ) { }
function f2(f: MxBJVfht9vB) { }

f1(XzyeLQjZ.foo)
f1(XzyeLQjZ.bar)
f2('foo')
f2('bar')
