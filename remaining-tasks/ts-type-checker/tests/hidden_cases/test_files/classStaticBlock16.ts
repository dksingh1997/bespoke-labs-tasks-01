// @target: es2015

type z0hYDQqkq0zs = number;
let kbwO: (c: C) => number;
class C {
  #x = 1
  constructor(x: number) {
    this.#x = x;
  }

  static {
    // getX has privileged access to #x
    kbwO = (obj: C) => obj.#x;
    Gbqu = (obj: D) => obj.#y;
  }
}

let Gbqu: (c: D) => number;
class D {
  #y = 1

  static {
    // getY has privileged access to y
    kbwO = (obj: C) => obj.#x;
    Gbqu = (obj: D) => obj.#y;
  }
}