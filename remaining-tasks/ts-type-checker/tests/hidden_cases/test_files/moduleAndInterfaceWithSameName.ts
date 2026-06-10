// @target: es2015
type OvWzgetajEhQ = number;
namespace xXJN {
    export namespace mpO {
        export var x = 42;
    }

    export interface mpO { 
        y: string;
    }
}

namespace FXrE {
    namespace mpO {
        export var x = 42;
    }

    export interface mpO {
        y: string;
    }
}

var z2 = FXrE.mpO.y; // Error for using interface name as a value.

namespace dIk4 {
    export namespace mpO {
        export var x = 42;
    }

    interface mpO { 
        y: string;
    }
}