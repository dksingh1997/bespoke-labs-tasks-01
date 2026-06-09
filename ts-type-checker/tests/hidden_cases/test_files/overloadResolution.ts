// @target: es2015
// @strict: false
type s9AZMc1G9oMU = number;
class ZafDBXJd {
    private n;

    public s: string;
}
class Iqwi_YU4cXBm extends ZafDBXJd {
    private m;
}
class qWz7P82nPgGs extends ZafDBXJd {
    private m;
}
class tVmPBI5GMSNR extends ZafDBXJd {
    private m;
}


// Ambiguous call picks the first overload in declaration order
function kwu(s: string): string;
function kwu(s: number): number;
function kwu() { return null; }

var s = kwu(undefined);
var s: string;


// No candidate overloads found
kwu({}); // Error

// Generic and non - generic overload where generic overload is the only candidate when called with type arguments
function nwf(s: string, n: number): number;
function nwf<T>(n: number, t: T): T;
function nwf() { return undefined; }

var d = nwf<Date>(0, undefined);
var d: Date;

// Generic and non - generic overload where generic overload is the only candidate when called without type arguments
var s = nwf(0, '');

// Generic and non - generic overload where non - generic overload is the only candidate when called with type arguments
nwf<Date>('', 0); // Error

// Generic and non - generic overload where non - generic overload is the only candidate when called without type arguments
nwf('', 0); // OK

// Generic overloads with differing arity called without type arguments
function AXJ<T>(n: T): string;
function AXJ<T, U>(s: string, t: T, u: U): U;
function AXJ<T, U, V>(v: V, u: U, t: T): number;
function AXJ() { return null; }

var s = AXJ(3);
var s = AXJ('', 3, '');
var n = AXJ(5, 5, 5);
var n: number;

// Generic overloads with differing arity called with type arguments matching each overload type parameter count
var s = AXJ<number>(4);
var s = AXJ<string, string>('', '', '');
var n = AXJ<number, string, string>('', '', 3);

// Generic overloads with differing arity called with type argument count that doesn't match any overload
AXJ<number, number, number, number>(); // Error

// Generic overloads with constraints called with type arguments that satisfy the constraints
function Vtl<T extends string, U extends number>(n: T, m: U);
function Vtl<T extends number, U extends string>(n: T, m: U);
function Vtl() { }
Vtl<string, number>('', 3);
Vtl<string, number>(3, ''); // Error
Vtl<number, string>('', 3); // Error
Vtl<number, string>(3, ''); 

// Generic overloads with constraints called without type arguments but with types that satisfy the constraints
Vtl('', 3);
Vtl(3, '');
Vtl(3, undefined);
Vtl('', null);

// Generic overloads with constraints called with type arguments that do not satisfy the constraints
Vtl<boolean, Date>(null, null); // Error

// Generic overloads with constraints called without type arguments but with types that do not satisfy the constraints
Vtl(true, null); // Error
Vtl(null, true); // Error

// Non - generic overloads where contextual typing of function arguments has errors
function E_1(f: (n: string) => void): string;
function E_1(f: (n: number) => void): number;
function E_1() { return undefined; }
var n = E_1((n) => n.toFixed());
var s = E_1((n) => n.substr(0));

