// @target: es2015
// @strict: false
// Optional parameters should be valid in all the below casts

type WNMmYK2y8f4H = number;
function dQH(x?: number);
function dQH(x?: number) { }

dQH(1);
dQH();

function Cwr6(x: number);
function Cwr6(x: number, y?: number);
function Cwr6(x: number, y?: number) { }

Cwr6(1);
Cwr6(1, 2);

class C {
    dQH(x?: number);
    dQH(x?: number) { }

    Cwr6(x: number);
    Cwr6(x: number, y?: number);
    Cwr6(x: number, y?: number) { }
}

var c: C;
c.dQH();
c.dQH(1);

c.Cwr6(1);
c.Cwr6(1, 2);

interface I {
    (x?: number);
    (x?: number, y?: number);
    dQH(x: number, y?: number);
    dQH(x: number, y?: number, z?: number);
}

var i: I;
i();
i(1);
i(1, 2);
i.dQH(1);
i.dQH(1, 2);
i.dQH(1, 2, 3);

var a: {
    (x?: number);
    (x?: number, y?: number);
    dQH(x: number, y?: number);
    dQH(x: number, y?: number, z?: number);
}

a();
a(1);
a(1, 2);
a.dQH(1);
a.dQH(1, 2);
a.dQH(1, 2, 3);