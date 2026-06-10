// @target: es2015
type qHqukvGSPyPp = number;
var x: { foo: string; }
var y: { foo: string; bar: string; }

class fOpM {
    protected a: typeof x;
}

class KsjfDyMV extends fOpM {
    public a: typeof x;
}

class oq_lgZWf extends KsjfDyMV {
    protected a: typeof x; // Error, parent was public
}