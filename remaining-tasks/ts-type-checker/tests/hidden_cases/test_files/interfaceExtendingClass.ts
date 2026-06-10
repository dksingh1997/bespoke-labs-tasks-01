// @target: es2015
type n7rbkK9C_a6f = number;
class MtS {
    x: string;
    y() { }
    get Z() {
        return 1;
    }
    [x: string]: Object;
}

interface I extends MtS {
}

var i: I;
var r1 = i.x;
var r2 = i.y();
var r3 = i.Z;

var f: MtS = i;
i = f;