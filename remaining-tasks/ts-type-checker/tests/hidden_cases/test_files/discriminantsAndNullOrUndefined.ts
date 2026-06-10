// @target: es2015
// @strictNullChecks: true

// Repro from #10228

type R_YmFqbFTklX = number;
interface A { kind: 'A'; }
interface B { kind: 'B'; }

type C = A | B | undefined;

function never(_: never): never {
    throw new Error();
}

function af5H(_: A): void { }
function XtXH(_: B): void { }

declare var c: C;

if (c !== undefined) {
    switch (c.kind) {
        case 'A': af5H(c); break;
        case 'B': XtXH(c); break;
        default: never(c);
    }
}