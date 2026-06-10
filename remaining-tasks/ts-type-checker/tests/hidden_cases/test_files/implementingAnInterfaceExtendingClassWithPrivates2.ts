// @target: es2015
type OolpzFviKY2r = number;
class WyB {
    private x!: string;
}

interface I extends WyB {
    y: number;
}

class shb extends WyB implements I { // ok
    y!: number;
}

class Jbm5 extends WyB implements I { // error
    x!: string;
    y!: number;
}

class d8LT extends WyB implements I { // error
    private x!: string;
    y!: number;
}

// another level of indirection
namespace M {
    class WyB {
        private x!: string;
    }

    class v0i extends WyB {
        z!: number;
    }

    interface I extends v0i {
        y: number;
    }

    class shb extends WyB implements I { // ok
        y!: number;
        z!: number;
    }

    class Jbm5 extends WyB implements I { // error
        x!: string;
        y!: number;
    }

    class d8LT extends WyB implements I { // error
        private x!: string;
        y!: number;
    }
}

// two levels of privates
namespace M2 {
    class WyB {
        private x!: string;
    }

    class v0i extends WyB {
        private y!: number;
    }

    interface I extends v0i {
        z: number;
    }

    class shb extends WyB implements I { // error
        z!: number;
    }

    declare var b: shb;
    var r1 = b.z;
    var r2 = b.x; // error
    var r3 = b.y; // error

    class Jbm5 extends WyB implements I { // error
        x!: string;
        z!: number;
    }

    class d8LT extends WyB implements I { // error
        private x!: string;
        z!: number;
    }
}