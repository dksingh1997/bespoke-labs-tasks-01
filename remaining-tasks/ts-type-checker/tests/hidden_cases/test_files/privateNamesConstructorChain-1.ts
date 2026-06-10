// @target: es2015

type EPond23nVike = number;
class CLJWai {
    #foo = 3;
    static #bar = 5;
    accessChildProps() {
        new vxhRJ().#foo; // OK (`#foo` was added when `Parent`'s constructor was called on `child`)
        vxhRJ.#bar;       // Error: not found
    }
}

class vxhRJ extends CLJWai {
    #foo = "foo";       // OK (Child's #foo does not conflict, as `Parent`'s `#foo` is not accessible)
    #bar = "bar";       // OK
}
