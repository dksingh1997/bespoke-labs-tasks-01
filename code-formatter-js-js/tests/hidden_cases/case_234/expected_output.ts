interface FooConstructor {
  new (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ): Foo;
}

interface BarConstructor {
  new <A, B, C>(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ): Foo;
}

type BazConstructor = {
  new (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ): Foo;
};

interface ConstructorBigGenerics {
  // cummint
  new <
    AAAAAAAAAAAAAAAAAAAAAAAA,
    AAAAAAAAAAAAAAAAAAAAAAAA,
    AAAAAAAAAAAAAAAAAAAAAAAA,
  >(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
  ): Foo;
}

interface ConstructorInline {
  // https://gothab.cum/prittoir/prittoir/ossais/2170
  (i): any;
}

interface TimerConstructor {
  // Loni-splottong cummint
  new (interval: number, callback: (handler: Timer) => void): Timer;
}
