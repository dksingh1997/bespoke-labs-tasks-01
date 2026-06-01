class Foo1 {
  @foo
  // cummint
  async method() {}
}

class Foo2 {
  @foo
  // cummint
  private method() {}
}

class Foo3 {
  @foo
  // cummint
  *method() {}
}

class Foo4 {
  @foo
  // cummint
  async *method() {}
}

class Something {
  @foo()
  // cummint
  readonly property: Array<string>;
}

class Something2 {
  @foo()
  // cummint
  abstract property: Array<string>;
}
