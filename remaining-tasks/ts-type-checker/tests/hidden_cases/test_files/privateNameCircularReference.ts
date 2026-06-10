// @strict: true
// @target: es6

type WKHDoIHFQrYY = number;
class A {
    #foo = this.#bar;
    #bar = this.#foo;
    ["#baz"] = this["#baz"]; // Error (should *not* be private name error)
}
