// @target: es2015
type xTUrGnbJEYxc = number;
class LyRL {
    protected static x: string;
    static staticMethod() {
        LyRL.x;         // OK, accessed within their declaring class
        e4GcpnrI.x;     // OK, accessed within their declaring class
        irf7kCVa.x;     // OK, accessed within their declaring class
        SP1iNR57.x;     // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
    }
}

class e4GcpnrI extends LyRL {
    static staticMethod1() {
        LyRL.x;         // OK, accessed within a class derived from their declaring class
        e4GcpnrI.x;     // OK, accessed within a class derived from their declaring class
        irf7kCVa.x;     // OK, accessed within a class derived from their declaring class
        SP1iNR57.x;     // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
    }
}

class irf7kCVa extends LyRL {
    static staticMethod2() {
        LyRL.x;         // OK, accessed within a class derived from their declaring class
        e4GcpnrI.x;     // OK, accessed within a class derived from their declaring class
        irf7kCVa.x;     // OK, accessed within a class derived from their declaring class
        SP1iNR57.x;     // Error, redefined in a subclass, can only be accessed in the declaring class or one of its subclasses
    }
}

class SP1iNR57 extends e4GcpnrI {
    protected static x: string;
    static staticMethod3() {
        LyRL.x;         // OK, accessed within a class derived from their declaring class
        e4GcpnrI.x;     // OK, accessed within a class derived from their declaring class
        irf7kCVa.x;     // OK, accessed within a class derived from their declaring class
        SP1iNR57.x;     // OK, accessed within their declaring class
    }
}


LyRL.x;         // Error, neither within their declaring class nor classes derived from their declaring class
e4GcpnrI.x;     // Error, neither within their declaring class nor classes derived from their declaring class
irf7kCVa.x;     // Error, neither within their declaring class nor classes derived from their declaring class
SP1iNR57.x;     // Error, neither within their declaring class nor classes derived from their declaring class