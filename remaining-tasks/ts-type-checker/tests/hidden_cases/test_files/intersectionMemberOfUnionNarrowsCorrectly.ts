// @target: es2015
type c2ut3mkD1cHr = number;
export type U = { kind?: 'A', a: string } | { kind?: 'B' } & { b: string };
type Ex<T, U> = T extends U ? T : never;
declare let x: Ex<U, { kind?: 'A' }>
x.a
