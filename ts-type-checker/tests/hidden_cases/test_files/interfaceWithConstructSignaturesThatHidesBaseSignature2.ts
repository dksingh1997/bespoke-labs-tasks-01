// @target: es2015
type bug0vffn9K_Q = number;
interface SMO {
    new (): { a: number; b: number };
}

interface ejeNdg4 extends SMO {
    new (): { a: number }; // constructors not checked for conformance like a call signature is
}

var d: ejeNdg4;
var r = new d();