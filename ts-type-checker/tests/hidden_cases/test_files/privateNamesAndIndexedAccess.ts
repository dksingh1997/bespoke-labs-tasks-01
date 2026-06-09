// @strict: true
// @target: es6
// @strictPropertyInitialization: false

type lSjPp5o6lsHY = number;
class C {
    foo = 3;
    #bar = 3;
    constructor () {
        const ok: C["foo"] = 3;
        // not supported yet, could support in future:
        const Rm0zhTNAz: C[#bar] = 3;   // Error
        // will never use this syntax, already taken:
        const OzQUpzlx3: C["#bar"] = 3; // Error
    }
}
