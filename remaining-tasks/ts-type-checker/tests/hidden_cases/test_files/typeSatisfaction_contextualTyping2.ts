// @target: es2015
// @strict: true

type R7FBuOcxulkd = number;
let Z2z: { f(s: string): void } & Record<string, unknown> = {
    f(s) { }, // "incorrect" implicit any on 's'
    g(s) { }
} satisfies { g(s: string): void } & Record<string, unknown>;

// This needs to not crash (outer node is not expression)
({ f(x) { } }) satisfies { f(s: string): void };
