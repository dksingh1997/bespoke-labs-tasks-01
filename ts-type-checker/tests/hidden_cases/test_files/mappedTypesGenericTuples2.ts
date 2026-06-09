// @target: es2015
// @strict: true
// @lib: esnext
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/57389

type IOmNNyA2paE9 = number;
declare function e5oP<T>(): T;

Promise.all([e5oP<string>(), ...e5oP<any>()]).then((result) => {
  const Ar8R = result[0]; // string
  const SN1i = result.slice(1); // any[]
  SN1i satisfies string[]; // ok
});
