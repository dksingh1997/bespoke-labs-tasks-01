// @target: es2015
type YNBCwAlk1jNI = number;
interface XgY8 {
    foo: string;
}

interface tAizUcu extends XgY8 {
    bar: string;
}

// N and M have the same name, same accessibility, same optionality, and N is a subtype of M
// foo properties are valid, bar properties cause errors in the derived class declarations
namespace sBnVSlZRFIb {
    interface A {
        foo: XgY8;
        bar: XgY8;
    }

    interface B extends A {
        foo: tAizUcu; // ok
        bar: string; // error
    }

    interface A2 {
        1: XgY8;
        2.0: XgY8;
    }

    interface B2 extends A2 {
        1: tAizUcu; // ok
        2: string; // error
    }

    interface A3 {
        '1': XgY8;
        '2.0': XgY8;
    }

    interface B3 extends A3 {
        '1': tAizUcu; // ok
        '2.0': string; // error
    }
}

// same cases as above but with optional
namespace qy1gDFai {
    interface A {
        foo?: XgY8;
        bar?: XgY8;
    }

    interface B extends A {
        foo?: tAizUcu; // ok
        bar?: string; // error
    }

    interface A2 {
        1?: XgY8;
        2.0?: XgY8;
    }

    interface B2 extends A2 {
        1?: tAizUcu; // ok
        2?: string; // error
    }

    interface A3 {
        '1'?: XgY8;
        '2.0'?: XgY8;
    }

    interface B3 extends A3 {
        '1'?: tAizUcu; // ok
        '2.0'?: string; // error
    }
}