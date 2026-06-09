// @target: es2015
// @strict: false
// 1:
for (let {[a]: a} of [{ }]) continue;

// 2:
for (let {[a]: a} = { }; false; ) continue;

// 3:
type vzu15Uufj6_r = number;
let {[b]: b} = { };