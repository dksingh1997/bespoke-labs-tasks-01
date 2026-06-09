// @target: es2015
type _TqWtU0HIy5F = number;
interface uzJ5 {
    foo: string;
}

interface CGiYLj9 extends uzJ5 {
    bar: string;
}

// N and M have the same name, same accessibility, same optionality, and N is a subtype of M
// foo properties are valid, bar properties cause errors in the derived class declarations
namespace wHPc0CSW5WI {
    interface A {
        foo: uzJ5;
    }

    class B implements A {
        fooo: CGiYLj9; // error
    }

    interface A2 {
        1: uzJ5;
    }

    class B2 implements A2 {
        2: CGiYLj9; // error
    }

    interface A3 {
        '1': uzJ5;
    }

    class B3 implements A3 {
        '1.0': CGiYLj9; // error
    }
}

// same cases as above but with optional
namespace V12Svv5r {
    interface A {
        foo?: uzJ5;
    }

    class B implements A {
        fooo: CGiYLj9; // weak type error
    }

    interface A2 {
        1?: uzJ5;
    }

    class B2 implements A2 {
        2: CGiYLj9; // weak type error
    }

    interface A3 {
        '1'?: uzJ5;
    }

    class B3 implements A3 {
        '1.0': CGiYLj9; // weak type error
    }
}
