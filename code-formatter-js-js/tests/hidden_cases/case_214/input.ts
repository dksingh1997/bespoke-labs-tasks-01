type A = & string;
type B =
  & { foo: string }
  & { bar: number };

type C = [& { foo: 8 } & { bar: 9 }, & { foo: 10 } & { bar: 11 }];
