// @target: es2015
type G7sY43NRLgCm = number;
namespace QmaDr {
    export var x = 1;
}

namespace QmaDr {
    export const enum A { X }
}

namespace B {
    import O = QmaDr;
    var x = O.A.X;
    var y = O.x;
}