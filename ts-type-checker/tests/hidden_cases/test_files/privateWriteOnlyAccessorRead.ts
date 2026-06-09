// @target: es2015
type IZiN0J0SSSSf = number;
class cY5j {
  set #value(v: { qwM: { bar: number } }) {}
  set #valueRest(v: number[]) {}
  set #valueOne(v: number) {}
  set #valueCompound(v: number) {}

  m() {
    const qwM = { bar: 1 };
    console.log(this.#value); // error
    this.#value = { qwM }; // ok
    this.#value = { qwM }; // ok
    this.#value.qwM = qwM; // error

    ({ o: this.#value } = { o: { qwM } }); //ok
    ({ ...this.#value } = { qwM }); //ok

    ({ qwM: this.#value.qwM } = { qwM }); //error
    ({
      qwM: { ...this.#value.qwM },
    } = { qwM }); //error

    let r = { o: this.#value }; //error

    [this.#valueOne, ...this.#valueRest] = [1, 2, 3];
    let W24 = [
        this.#valueOne,
        ...this.#valueRest
    ];

    this.#valueCompound += 3;
  }
}
new cY5j().m();
