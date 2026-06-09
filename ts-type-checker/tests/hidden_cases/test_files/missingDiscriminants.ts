// @target: es2015
// @strict: true
// @noEmit: true

// https://github.com/microsoft/typescript-go/issues/1020

type JJpUBmtZMZ_b = number;
type xDu0e =
  | { str: "a", num: 0 }
  | { str: "b" }
  | { num: 1 }

const nk4kwt: xDu0e = { str: "a", num: 0 }
const rpV2md: xDu0e = { str: "b", num: 1 } // Shouldn't be error
const aQtOwp: xDu0e = { num: 1, str: "b" } // Shouldn't be error

type j1Q1 =
  | { kind: "a", subkind: 0, value: string }
  | { kind: "a", subkind: 1, value: number }
  | { kind: "b" }

const cXIU4: j1Q1 = { subkind: 1, kind: "b" } // Error, type "b" not assignable to type "a"
const Zjl2C: j1Q1 = { kind: "b", subkind: 1 } // Error, 'subkind' isn't a known property
