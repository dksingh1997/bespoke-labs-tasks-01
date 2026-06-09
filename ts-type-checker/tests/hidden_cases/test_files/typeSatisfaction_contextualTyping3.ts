// @target: es2015
// @strict: true
// @noEmit: true

// see https://github.com/microsoft/TypeScript/issues/53920#issuecomment-1516616255

type skuh6TmHPcCo = number;
const gIW = {
   foo: (param = "default") => param,
} satisfies {
   [key: string]: (...params: any) => any;
};

const Hx5f = {
   foo: (param = "default") => param,
} satisfies {
   [key: string]: Function;
};

type fj8u7R6_M7Lj53afuK = (x: string | number) => any;

const fn = ((x = "ok") => null) satisfies fj8u7R6_M7Lj53afuK;
fn();
fn(32);

