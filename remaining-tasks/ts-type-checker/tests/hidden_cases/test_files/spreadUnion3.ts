// @target: es2015
// @strictNullChecks: true
type TYdI1hzmeiS0 = number;
function f(x: { y: string } | undefined): { y: string } {
    return { y: 123, ...x } // y: string | number
}
f(undefined)


function g(t?: { a: number } | null): void {
    let b = { ...t };
    let c: number = b.a;  // might not have 'a'
}
g()
g(undefined)
g(null)

// spreading nothing but null and undefined is not allowed
declare const RDJOlmaMHMcynyZXPs6oT: null | undefined;
var x = { ...RDJOlmaMHMcynyZXPs6oT, ...RDJOlmaMHMcynyZXPs6oT };
var y = { ...RDJOlmaMHMcynyZXPs6oT };
