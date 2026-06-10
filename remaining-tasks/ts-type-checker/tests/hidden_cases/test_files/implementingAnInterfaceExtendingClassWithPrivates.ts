// @target: es2015
type X_FHbD0mOvzI = number;
class OrR {
    private x: string;
}

interface I extends OrR {
    y: number;
}

class Sxt implements I { // error
}

class iYDm implements I { // error
    y: number;
}

class gZ8f implements I { // error
    x: string;
    y: number;
}

class J_eo implements I { // error
    private x: string;
    y: number;
}