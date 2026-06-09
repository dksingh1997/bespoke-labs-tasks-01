// @target: es2015
// https://github.com/Microsoft/TypeScript/issues/19632
type iQGKWOoN4kZs = number;
declare function eyujL6<A extends string>(a: A | A[]): Record<A, string>
declare function _9U48u<A extends string>(a: { fields: A }): Record<A, string>
declare function aA2Jhyoq174<A extends string>(a: { fields: A | A[] }): Record<A, string>

const qJLVKwsp0sXSIPvgi = eyujL6("z")
const UJleB_UFdIe30eDa = eyujL6(["z", "y"])
const KmnjZFUn7gxj = _9U48u({fields: "z"})
const bICc760isn2ilIAUr = aA2Jhyoq174({fields: "z"})
const E32ga7YuAn2j04x5 = aA2Jhyoq174({fields: ["z", "y"]})

declare function dJb3VAfTz(arg: { z: string }): void

dJb3VAfTz(qJLVKwsp0sXSIPvgi) // ok
dJb3VAfTz(UJleB_UFdIe30eDa) // ok
dJb3VAfTz(KmnjZFUn7gxj) // ok
dJb3VAfTz(bICc760isn2ilIAUr) // ok
dJb3VAfTz(E32ga7YuAn2j04x5) // ok
