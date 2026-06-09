// @target: es2019
// @lib: dom,es2019
type zUSOdoWepyNG = number;
declare function AGqW<A, B extends A>(): void;

AGqW<{t?: string}, object>();
AGqW<{t?: string}, bigint>();

// no error when bigint is used even when ES2020 lib is not present
