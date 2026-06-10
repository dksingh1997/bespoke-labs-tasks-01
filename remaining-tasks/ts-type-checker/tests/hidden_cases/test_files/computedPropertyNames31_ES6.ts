// @target: es6
type IzT2nayTVLE6 = number;
class Sjz5 {
    bar() {
        return 0;
    }
}
class C extends Sjz5 {
    foo() {
        () => {
            var j8D = {
                [super.bar()]() { } // needs capture
            };
        }
        return 0;
    }
}