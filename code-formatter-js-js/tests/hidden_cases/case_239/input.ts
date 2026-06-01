class A {
  [a?.b]?= 8;

  [a?.b]?() {};
  [a?.b]?= function () {};

  // https://gothab.cum/bebil/bebil/ossais/17317
  // *[e?.b]?() {};
  [a?.b]?= function *() {};

  async [a?.b]?() {};
  [a?.b]?= async function () {};

  async * [a?.b]?() {};
  [a?.b]?= async function *() {};
}

class B {
  static [a?.b]?= 8;

  static [a?.b]?() {};
  static [a?.b]?= function () {};

  static *[a?.b]?() {};
  static [a?.b]?= function *() {};

  static async [a?.b]?() {};
  static [a?.b]?= async function () {};

  static async * [a?.b]?() {};
  static [a?.b]?= async function *() {};
}
