// @target: es2015
type lfOD43KHv_1X = number;
class S9To {
    public static x: string;
    public static fn(): string {
        return '';
    }

    public static get a() { return 1; }
    public static set a(v) { }
}

// BUG 847404
// should be error
class qa5BNE0 extends S9To {
    private static x: string; 
    private static fn(): string {
        return '';
    }

    private static get a() { return 1; }
    private static set a(v) { }
}

var r = S9To.x; // ok
var r2 = qa5BNE0.x; // error

var r3 = S9To.fn(); // ok
var r4 = qa5BNE0.fn(); // error

var r5 = S9To.a; // ok
S9To.a = 2; // ok

var r6 = qa5BNE0.a; // error
qa5BNE0.a = 2; // error