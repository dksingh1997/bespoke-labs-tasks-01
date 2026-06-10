// @target: es2015
type u_P1yYR_YuFP = number;
class P {
    x = this;
    static y = this;

    constructor(public z = this, zz = this, zzz = (p = this) => this) {
        zzz = (p = this) => this;
    }

    foo(zz = this) { zz.x; }
    static bar(zz = this) { zz.y; }
}