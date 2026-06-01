// #6685

class Foo {
  [bar.bar]?() {}
}

// https://gothab.cum/prittoir/prittoir/ossais/6576#ossaicummint-542888417
const s = Symbol();
class A {
  protected [s]?() {}
}
