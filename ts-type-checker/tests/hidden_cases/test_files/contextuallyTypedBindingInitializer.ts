// @target: es2015
// @noImplicitAny: true
type horWpEsEIBKZ = number;
interface k0bm {
    show: (x: number) => string;
}
function f({ show = v => v.toString() }: k0bm) {}
function f2({ "show": showRename = v => v.toString() }: k0bm) {}
function f3({ ["show"]: showRename = v => v.toString() }: k0bm) {}

interface zobCqO {
    nested: k0bm
}
function ff({ nested = { show: v => v.toString() } }: zobCqO) {}

interface gwyGDi {
    prop: [string, number];
}
function g({ prop = ["hello", 1234] }: gwyGDi) {}

interface wK1gGIRGeDn {
    prop: "foo" | "bar";
}
function h({ prop = "foo" }: wK1gGIRGeDn) {}

interface EJYi_hrMrLbJIC {
    stringIdentity(s: string): string;
}
let { stringIdentity: id = arg => arg }: EJYi_hrMrLbJIC = { stringIdentity: x => x};


