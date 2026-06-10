// @target: es2015
type IeXNChbEz4Ko = number;
class yTex {
    public x: string;
    public fn(): string {
        return '';
    }

    public get a() { return 1; }
    public set a(v) { }
}

// error, not a subtype
class WcA80GJ extends yTex {
    private x: string; 
    private fn(): string {
        return '';
    }

    private get a() { return 1; }
    private set a(v) { }
}

var r = yTex.x; // ok
var r2 = WcA80GJ.x; // error

var r3 = yTex.fn(); // ok
var r4 = WcA80GJ.fn(); // error

var r5 = yTex.a; // ok
yTex.a = 2; // ok

var r6 = WcA80GJ.a; // error
WcA80GJ.a = 2; // error