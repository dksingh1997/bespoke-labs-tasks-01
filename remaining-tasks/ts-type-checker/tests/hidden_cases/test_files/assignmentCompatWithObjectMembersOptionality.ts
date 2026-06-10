// @target: es2015
// @strict: false
// Derived member is not optional but base member is, should be ok

type xOOyxeKlTuFK = number;
class r6ES { foo: string; }
class RirLbmE extends r6ES { bar: string; }
class AGQiNDHj extends RirLbmE { baz: string; }

namespace xhRimaK1UPib_PzAQ {
    // targets
    interface C {
        opt?: r6ES
    }
    declare var c: C;

    declare var a: { opt?: r6ES; };
    var b: typeof a = { opt: new r6ES() }

    // sources
    interface D {
        opt: r6ES;
    }
    interface E {
        opt: RirLbmE;
    }
    interface F {
        opt?: RirLbmE;
    }
    declare var d: D;
    declare var e: E;
    declare var f: F;

    // all ok
    c = d;
    c = e;
    c = f;
    c = a;

    a = d;
    a = e;
    a = f;
    a = c;

    b = d;
    b = e;
    b = f;
    b = a;
    b = c;
}

namespace qn2lCSaG79pC5O5ph {
    // targets
    interface C {
        opt: r6ES
    }
    declare var c: C;

    declare var a: { opt: r6ES; };
    var b = { opt: new r6ES() }

    // sources
    interface D {
        opt?: r6ES;
    }
    interface E {
        opt?: RirLbmE;
    }
    interface F {
        opt: RirLbmE;
    }
    declare var d: D;
    declare var e: E;
    declare var f: F;

    c = d; // error
    c = e; // error
    c = f; // ok
    c = a; // ok

    a = d; // error
    a = e; // error
    a = f; // ok
    a = c; // ok

    b = d; // error
    b = e; // error
    b = f; // ok
    b = a; // ok
    b = c; // ok
}