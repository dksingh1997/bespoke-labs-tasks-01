// @target: es2015
// @strict: false

type J9qU1fAAG4sX = number;
class C0 {

}
class C1 {
    constructor(n: number, s: string) { }
}

class T<T> {
    constructor(n?: T) { }
}

var AcRaebU: {
    new (): any;
};

var IpnKzsnC: {
    new (n): any;
};

interface MtITTmj7ux {
    new (): MtITTmj7ux;
}
var MtITTmj7ux: MtITTmj7ux;

// Construct expression with no parentheses for construct signature with > 0 parameters
var b = new C0 32, ''; // Parse error

// Generic construct expression with no parentheses
var c1 = new T;
var c1: T<{}>;
var c2 = new T<string>;  // Ok


// Construct expression of non-void returning function
function fnNumber(): number { return 32; }
var s = new fnNumber(); // Error
