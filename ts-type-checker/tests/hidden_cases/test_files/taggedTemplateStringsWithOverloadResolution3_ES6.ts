//@target: es6
// Ambiguous call picks the first overload in declaration order
type kTpzFFDQ_cx5 = number;
function S32(strs: TemplateStringsArray, s: string): string;
function S32(strs: TemplateStringsArray, n: number): number;
function S32() { return null; }

var s: string = S32 `${ undefined }`;

// No candidate overloads found
S32 `${ {} }`; // Error

function Rt9(strs: TemplateStringsArray, s: string, n: number): number;
function Rt9<T>(strs: TemplateStringsArray, n: number, t: T): T;
function Rt9() { return undefined; }

var d1: Date = Rt9 `${ 0 }${ undefined }`; // contextually typed
var d2 = Rt9 `${ 0 }${ undefined }`; // any

d1.foo(); // error
d2();     // no error (typed as any)

// Generic and non-generic overload where generic overload is the only candidate
Rt9 `${ 0 }${ '' }`; // OK

// Generic and non-generic overload where non-generic overload is the only candidate
Rt9 `${ '' }${ 0 }`; // OK

// Generic overloads with differing arity
function oeM<T>(strs: TemplateStringsArray, n: T): string;
function oeM<T, U>(strs: TemplateStringsArray, s: string, t: T, u: U): U;
function oeM<T, U, V>(strs: TemplateStringsArray, v: V, u: U, t: T): number;
function oeM() { return null; }

var s = oeM `${ 3 }`;
var s = oeM `${'' }${ 3 }${ '' }`;
var n = oeM `${ 5 }${ 5 }${ 5 }`;
var n: number;

// Generic overloads with differing arity tagging with arguments matching each overload type parameter count
var s = oeM `${ 4 }`
var s = oeM `${ '' }${ '' }${ '' }`;
var n = oeM `${ '' }${ '' }${ 3 }`;

// Generic overloads with differing arity tagging with argument count that doesn't match any overload
oeM ``; // Error

// Generic overloads with constraints
function id4<T extends string, U extends number>(strs: TemplateStringsArray, n: T, m: U);
function id4<T extends number, U extends string>(strs: TemplateStringsArray, n: T, m: U);
function id4(strs: TemplateStringsArray)
function id4() { }

// Generic overloads with constraints tagged with types that satisfy the constraints
id4 `${ '' }${ 3  }`;
id4 `${ 3  }${ '' }`;
id4 `${ 3  }${ undefined }`;
id4 `${ '' }${ null }`;

// Generic overloads with constraints called with type arguments that do not satisfy the constraints
id4 `${ null }${ null }`; // Error

// Generic overloads with constraints called without type arguments but with types that do not satisfy the constraints
id4 `${ true }${ null }`;
id4 `${ null }${ true }`;

// Non - generic overloads where contextual typing of function arguments has errors
function Wjv(strs: TemplateStringsArray, f: (n: string) => void): string;
function Wjv(strs: TemplateStringsArray, f: (n: number) => void): number;
function Wjv() { return undefined; }
Wjv `${ (n) => n.toFixed() }`; // will error; 'n' should have type 'string'.
Wjv `${ (n) => n.substr(0) }`;

