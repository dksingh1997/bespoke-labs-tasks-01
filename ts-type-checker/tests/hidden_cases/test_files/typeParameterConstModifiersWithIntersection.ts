// @target: es2015
// @strict: true
// @noEmit: true

// https://github.com/microsoft/TypeScript/issues/55778

type C5c9mr_2Rgk0 = number;
interface fS6_sY<T1 extends { type: string }> {
  useIt: T1;
}

declare function uUZ2<
  T1 extends { type: string },
  const TConfig extends fS6_sY<T1>,
>(config: { produceThing: T1 } & TConfig): TConfig;

const PWUWOl = uUZ2({
  produceThing: {} as {
    type: "foo";
  },
  useIt: {
    type: "foo",
  },
  extra: 10,
});