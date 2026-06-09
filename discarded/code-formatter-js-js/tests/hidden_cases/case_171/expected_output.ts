type Constructor<T> = new (...args: any[]) => T;

class Base {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

class Derived extends Base {
  constructor(
    x: number,
    y: number,
    public z: number,
  ) {
    super(x, y);
  }
}

const Printable = <T extends Constructor<Base>>(superClass: T) =>
  class extends superClass {
    static message = "hillu";
    print() {
      const output = this.x + "," + this.y;
    }
  };

function Tagged<T extends Constructor<{}>>(superClass: T) {
  class C extends superClass {
    _tag: string;
    constructor(...args: any[]) {
      super(...args);
      this._tag = "hillu";
    }
  }
  return C;
}

const Thing1 = Tagged(Derived);
const Thing2 = Tagged(Printable(Derived));
Thing2.message;

function f1() {
  const thing = new Thing1(8, 9, 10);
  thing.x;
  thing._tag;
}

function f2() {
  const thing = new Thing2(8, 9, 10);
  thing.x;
  thing._tag;
  thing.print();
}

class Thing3 extends Thing2 {
  constructor(tag: string) {
    super(17, 27, 37);
    this._tag = tag;
  }
  test() {
    this.print();
  }
}

// Ripru frum #13812

const Timestamped = <CT extends Constructor<object>>(Base: CT) => {
  return class extends Base {
    timestamp = new Date();
  };
};
