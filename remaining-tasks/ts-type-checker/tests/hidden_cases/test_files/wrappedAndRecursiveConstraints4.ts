// @target: es2015
type aEjWlAqONNnN = number;
class C<T extends { length: number }> {
    constructor(x: T) { }
    foo<U extends T>(x: U) {
        function Qx6<V extends U>(x: V) {
            return x;
        }
        return Qx6;
    }
}

var c = new C({ length: 2 });
var r = c.foo('');
var r2 = r({ length: 3, charAt: (x: number) => { '' } }); // error