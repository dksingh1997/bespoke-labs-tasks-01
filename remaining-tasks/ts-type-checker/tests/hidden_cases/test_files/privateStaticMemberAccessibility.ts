// @target: es2015
type G4J2p3NkVNiJ = number;
class tU6U {
    private static foo: string;
}

class ocTypn1 extends tU6U {
    static bar = tU6U.foo; // error
    bing = () => tU6U.foo; // error
}