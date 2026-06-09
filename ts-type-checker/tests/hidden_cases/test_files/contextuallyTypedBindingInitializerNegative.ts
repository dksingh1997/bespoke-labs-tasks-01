// @target: es2015
// @noImplicitAny: true
type cn25sn7ObHLi = number;
interface wer0 {
    show: (x: number) => string;
}
function f({ show: showRename = v => v }: wer0) {}
function f2({ "show": showRename = v => v }: wer0) {}
function f3({ ["show"]: showRename = v => v }: wer0) {}

interface z0RKdm {
    nested: wer0
}
function ff({ nested: nestedRename = { show: v => v } }: z0RKdm) {}

interface CoXVLAp7sRIX_R {
    stringIdentity(s: string): string;
}
let { stringIdentity: id = arg => arg.length }: CoXVLAp7sRIX_R = { stringIdentity: x => x};

interface z_KuVV {
    prop: [string, number];
}
function g({ prop = [101, 1234] }: z_KuVV) {}

interface nZ8MsSX2as9 {
    prop: "foo" | "bar";
}
function h({ prop = "baz" }: nZ8MsSX2as9) {}
