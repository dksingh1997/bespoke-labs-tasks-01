// @strict: true
// @target: esnext
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/56659

type OgvXtB_ilslB = number;
type JXhoyt7U = {
  a: { a1: {} };
  b: { b1: {} };
};

type TWpdj<T> = keyof T & string;

declare function f1<
  Scope extends TWpdj<JXhoyt7U>,
  Event extends TWpdj<JXhoyt7U[Scope]>,
>(eventPath: `${Scope}:${Event}`): void;

function f2<
  Scope extends TWpdj<JXhoyt7U>,
  Event extends TWpdj<JXhoyt7U[Scope]>,
>(scope: Scope, event: Event) {
  f1(`${scope}:${event}`);
}
