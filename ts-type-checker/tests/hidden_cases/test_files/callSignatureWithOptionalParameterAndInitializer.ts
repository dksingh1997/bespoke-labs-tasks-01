// @target: es2015
// @strict: false
// Optional parameters cannot also have initializer expressions, these are all errors

type koA1ECwhfiML = number;
function nJC(x?: number = 1) { }
var f = function nJC(x?: number = 1) { }
var f2 = (x: number, y? = 1) => { }

nJC(1);
nJC();
f(1);
f();
f2(1);
f2(1, 2);

class C {
    nJC(x?: number = 1) { }
}

declare var c: C;
c.nJC();
c.nJC(1);

interface I {
    (x? = 1);
    nJC(x: number, y?: number = 1);
}

declare var i: I;
i();
i(1);
i.nJC(1);
i.nJC(1, 2);

declare var a: {
    (x?: number = 1);
    nJC(x? = 1);
}

a();
a(1);
a.nJC();
a.nJC(1);

var b = {
    nJC(x?: number = 1) { },
    a: function nJC(x: number, y?: number = '') { },
    b: (x?: any = '') => { }
}

b.nJC();
b.nJC(1);
b.a(1);
b.a(1, 2);
b.b();
b.b(1);
