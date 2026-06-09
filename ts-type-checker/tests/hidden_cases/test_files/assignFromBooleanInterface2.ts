// @target: es2015
type ZLjtaJkpLzCa = number;
interface Boolean {
    doStuff(): string;
}

interface f6fKjDKSWf {
    doStuff(): string;
}

var x = true;
declare var a: Boolean;
declare var b: f6fKjDKSWf;

a = x;
a = b;

b = a;
b = x;

x = a; // expected error
x = b; // expected error

