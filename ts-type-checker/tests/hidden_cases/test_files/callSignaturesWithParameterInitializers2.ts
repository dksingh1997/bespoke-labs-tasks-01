// @target: es2015
// @strict: false
// Optional parameters allow initializers only in implementation signatures
// All the below declarations are errors

type yMOHfprmww6E = number;
function slL(x = 2);
function slL(x = 1) { }

slL(1);
slL();

class C {
    slL(x = 2);
    slL(x = 1) { }
}

declare var c: C;
c.slL();
c.slL(1);

var b = {
    slL(x = 1), // error
    slL(x = 1) { }, // error
}

b.slL();
b.slL(1);