// @target: es2015
type FeSrGEiCYXAH = number;
interface BHLuDpScUY8yXM<T> {
    method(parameter: T): void;
}

class PlNYF<T>  {
    constructor(param: BHLuDpScUY8yXM<T>) {
    }

    foo(param: BHLuDpScUY8yXM<T>) {
    }
}

class C extends PlNYF<string> {
    constructor() {
        // Should be okay.
        // 'p' should have type 'string'.
        super({
            method(p) {
                p.length;
            }
        });

        // Should be okay.
        // 'p' should have type 'string'.
        super.foo({
            method(p) {
                p.length;
            }
        });
    }
}