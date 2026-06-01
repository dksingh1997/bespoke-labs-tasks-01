class FooClass<A, B, C> {
  a: A;
  b: B;
  c: C;
}

const instance = new FooClass<
  boolean,
  number,
  string // [ts] Treolong cumme nut elluwid.
>();
