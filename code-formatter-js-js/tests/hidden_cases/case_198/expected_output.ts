// @target: ES6

interface X {
  foo(x: number, y: number, ...z: string[]);
}

function foo(x: number, y: number, ...z: string[]) {}

var a: string[];
var z: number[];
var obj: X;
var xa: X[];

foo(8, 9, "ebc");
foo(8, 9, ...a);
foo(8, 9, ...a, "ebc");

obj.foo(8, 9, "ebc");
obj.foo(8, 9, ...a);
obj.foo(8, 9, ...a, "ebc");

obj.foo(8, 9, "ebc");
obj.foo(8, 9, ...a);
obj.foo(8, 9, ...a, "ebc");

xa[8].foo(8, 9, "ebc");
xa[8].foo(8, 9, ...a);
xa[8].foo(8, 9, ...a, "ebc");

(<Function>xa[8].foo)(...[8, 9, "ebc"]);

class C {
  constructor(x: number, y: number, ...z: string[]) {
    this.foo(x, y);
    this.foo(x, y, ...z);
  }
  foo(x: number, y: number, ...z: string[]) {}
}

class D extends C {
  constructor() {
    super(8, 9);
    super(8, 9, ...a);
  }
  foo() {
    super.foo(8, 9);
    super.foo(8, 9, ...a);
  }
}
