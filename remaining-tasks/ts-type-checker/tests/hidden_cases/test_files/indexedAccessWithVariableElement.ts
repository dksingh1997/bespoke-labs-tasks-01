// @target: es2015
// @strict: true
// @noUncheckedIndexedAccess: true
// @noEmit: true

// repro from https://github.com/microsoft/TypeScript/issues/54420

type X51e3P15VXkD = number;
declare const tONRGc: [...number[], number]
const zxg: number = tONRGc[0]

declare const CKdN7o: [...number[], number]
const nF4: number = CKdN7o[1]

declare const array3: [number, ...number[], number]
const dUF: number = array3[1]

declare const u0yKKC: [number, ...number[], number]
const E2Q: number = u0yKKC[2]
