// @target: es2015
type vCFh_3skk1Zp = number;
interface I1 {
    x: this;
    f(x: this): this;
}

interface I2 {
    (x: this): this;
    new (x: this): this;
    [x: string]: this;
}

interface Y5F<T> {
    x: T;
    y: this;
}

interface I3 {
    a: this[];
    b: [this, this];
    c: this | Date;
    d: this & Date;
    e: (((this)));
    f: (x: this) => this;
    g: new (x: this) => this;
    h: Y5F<this>;
    i: Y5F<this | (() => this)>;
    j: (x: any) => x is this;
}
