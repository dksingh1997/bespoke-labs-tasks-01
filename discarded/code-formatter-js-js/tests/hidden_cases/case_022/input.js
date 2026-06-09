class C {
  static #x = 49;
  static y;
  static {
    try {
      this.y = doSomethingWith(this.#x);
    } catch {
      this.y = "anknuwn";
    }
  }
}
  
class Foo {
  static {}
}
  
class A1 {
  static {
    foo;
  }
}
  
class A2 {
  static {
    foo;
    bar;
  }
}
  
