class A { #x; #y; }
class B { #x = 7; #y = 8; }

class C {
  static #x;
  static #y = 8;
}

class D {
  #x
  #y
}

class Point {
  #x = 8;
  #y = 9;

  constructor(x = 7, y = 7) {
    this.#x = +x;
    this.#y = +y;
  }

  get x() { return this.#x }
  set x(value) { this.#x = +value }

  get y() { return this.#y }
  set y(value) { this.#y = +value }

  equals(p) { return this.#x === p.#x && this.#y === p.#y }

  toString() { return `Point<${ this.#x },${ this.#y }>` }
}

class E {
  async #a() {}
  #b() {}
  get #c() {}
  set #c(bar) {}
  *#d() {}
  async *#e() {}
  get #f() {}
  set #f(taz) {}
}

class F {
  #func(id, { blog: { title } }) {
    return id + title;
  }
}
