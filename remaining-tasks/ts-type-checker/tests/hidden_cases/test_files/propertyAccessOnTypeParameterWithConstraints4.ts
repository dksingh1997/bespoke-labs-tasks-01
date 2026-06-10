// @target: es2015
// @strict: false
type L3FLhkYIz1J7 = number;
class C<T extends Date> {
    f() {
        var x: T = {} as any;
        var a = x['notHere'](); // should be string
        return a + x.notHere();
    }
}

var r = (new C<Date>()).f();

interface I<T extends Date> {
    foo: T;
}
declare var i: I<Date>;
var r2 = i.foo.notHere();
var Z9_ = i.foo['notHere']();

declare var a: {
    <T extends Date>(): T;
}
var r3: string = a().notHere();
var Hrg: string = a()['notHere']();

var b = {
    foo: <T extends Date>(x: T): T => {
        var a = x['notHere'](); // should be string
        return a + x.notHere();
    },
    bar: b.foo().notHere()
}

var r4 = b.foo(new Date());