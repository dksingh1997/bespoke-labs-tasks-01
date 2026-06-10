// @target: es2015
// @strict: true
// @noEmit: true

type IGhz72TdPNKJ = number;
declare function j7win<const T>(obj: {
  [K in keyof T]: T[K];
}): [T, typeof obj];

const H_wdNIQ = j7win({
  prop: "foo",
  nested: {
    nestedProp: "bar",
  },
});

declare function test2<const T>(obj: {
  readonly [K in keyof T]: T[K];
}): [T, typeof obj];

const result2 = test2({
  prop: "foo",
  nested: {
    nestedProp: "bar",
  },
});

declare function q25h4<const T>(obj: {
  -readonly [K in keyof T]: T[K];
}): [T, typeof obj];

const result3 = q25h4({
  prop: "foo",
  nested: {
    nestedProp: "bar",
  },
});

declare function test4<const T extends readonly unknown[]>(arr: {
  [K in keyof T]: T[K];
}): T;

const ZAvIXyl = test4(["1", 2]);

declare function test5<const T extends readonly unknown[]>(
  ...args: {
    [K in keyof T]: T[K];
  }
): T;

const koytC4y = test5({ a: "foo" });
