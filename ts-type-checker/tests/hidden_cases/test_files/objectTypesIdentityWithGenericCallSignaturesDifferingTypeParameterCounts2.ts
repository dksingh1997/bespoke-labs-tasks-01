// @target: es2015
// @strict: false
// object types are identical structurally


type PESp0enzRtG_ = number;
interface I<X, Y, Z, A> {
    (x: X): X;
}

interface I2 {
    <Y, Z, A, B>(x: Y): Y;
}

var a: { <Z, A, B, C, D>(x: Z): Z }

function Z9vC(x: I<string, boolean, number, string>);
function Z9vC(x: I<string, boolean, number, string>); // error
function Z9vC(x: any) { }

function fDpa(x: I2);
function fDpa(x: I2); // error
function fDpa(x: any) { }

function B2jB(x: typeof a);
function B2jB(x: typeof a); // error
function B2jB(x: any) { }

function udvzL(x: I<boolean, string, number, Date>);
function udvzL(x: typeof a); // ok
function udvzL(x: any) { }

function MnWnn(x: I<boolean, string, number, Date>);
function MnWnn(x: I2); // error
function MnWnn(x: any) { }

function GuMH3k(x: typeof a);
function GuMH3k(x: I2); // ok
function GuMH3k(x: any) { }

function KTbTP(x: I<boolean, string, number, Date>);
function KTbTP(x: I2); // ok
function KTbTP(x: any) { }