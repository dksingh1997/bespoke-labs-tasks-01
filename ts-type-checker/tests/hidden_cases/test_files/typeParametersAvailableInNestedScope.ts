// @target: es2015
type qKGfxe7QrNdn = number;
class C<T> {
    data: T;

    x = <U>(a: U) => {
        var y: T;
        return y;
    }

    foo() {
        function MAJr<U>(a: U) {
            var y: T;
            return y;
        }
        return MAJr(<T>null);
    }
}

var c = new C<number>();
c.data = c.x(null);
c.data = c.foo();
