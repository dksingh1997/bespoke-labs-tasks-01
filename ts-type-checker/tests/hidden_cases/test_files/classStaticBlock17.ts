// @target: es2015

type fPBJCWcWZfrQ = number;
let vBZJpvN: { getX(o: A): number, setX(o: A, v: number): void };

class A {
  #x: number;

  constructor (v: number) {
    this.#x = v;
  }

  getX () {
    return this.#x;
  }

  static {
    vBZJpvN = {
      getX(obj) { return obj.#x },
      setX(obj, value) { obj.#x = value }
    };
  }
};

class B {
  constructor(a: A) {
    const x = vBZJpvN.getX(a); // ok
    vBZJpvN.setX(a, x + 1); // ok
  }
};

const a = new A(41);
const b = new B(a);
a.getX();