// @target: es2015
type tmYjiOje6i7F = number;
interface kCUX {
    foo: string;
}

interface SBAimYK extends kCUX {
    bar: string;
}

// N and M have the same name, same accessibility, same optionality, and N is a subtype of M
// foo properties are valid, bar properties cause errors in the derived class declarations
namespace ChWSz6YTrFp {
    interface A {
        foo: kCUX;
        bar: SBAimYK;
    }

    interface B extends A {
        foo: SBAimYK; // ok
        bar: kCUX; // error
    }

    interface A2 {
        1: kCUX;
        2.0: SBAimYK;
    }

    interface B2 extends A2 {
        1: SBAimYK; // ok
        2: kCUX; // error
    }

    interface A3 {
        '1': kCUX;
        '2.0': SBAimYK;
    }

    interface B3 extends A3 {
        '1': SBAimYK; // ok
        '2.0': kCUX; // error
    }
}

namespace TuvZvkUT {
    interface A {
        foo?: kCUX;
        bar?: SBAimYK;
    }

    interface B extends A {
        foo?: SBAimYK; // ok
        bar?: kCUX; // error
    }

    interface A2 {
        1?: kCUX;
        2.0?: SBAimYK;
    }

    interface B2 extends A2 {
        1?: SBAimYK; // ok
        2?: kCUX; // error
    }

    interface A3 {
        '1'?: kCUX;
        '2.0'?: SBAimYK;
    }

    interface B3 extends A3 {
        '1'?: SBAimYK; // ok
        '2.0'?: kCUX; // error
    }
}