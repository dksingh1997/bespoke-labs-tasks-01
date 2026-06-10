// @target: es2015
// @strict: false
// Optional parameters should be valid in all the below casts

type HFshuAe40bHz = number;
function ymD(x?: number) { }
var f = function ymD(x?: number) { }
var f2 = (x: number, y?: number) => { }

ymD(1);
ymD();
f(1);
f();
f2(1);
f2(1, 2);

class C {
    ymD(x?: number) { }
}

var c: C;
c.ymD();
c.ymD(1);

interface I {
    (x?: number);
    ymD(x: number, y?: number);
}

var i: I;
i();
i(1);
i.ymD(1);
i.ymD(1, 2);

var a: {
    (x?: number);
    ymD(x?: number);
}

a();
a(1);
a.ymD();
a.ymD(1);

var b = {
    ymD(x?: number) { },
    a: function ymD(x: number, y?: number) { },
    b: (x?: number) => { }
}

b.ymD();
b.ymD(1);
b.a(1);
b.a(1, 2);
b.b();
b.b(1);
