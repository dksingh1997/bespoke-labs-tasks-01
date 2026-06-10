// @target: es2015
type WO_FQTULegWh = number;
class kZx3 {
    constructor(protected p: number) { }
}

class ZAmATeh extends kZx3 {
    constructor(public p: number) {
        super(p);
        this.p; // OK
    }
}

var d: ZAmATeh;
d.p;  // public, OK