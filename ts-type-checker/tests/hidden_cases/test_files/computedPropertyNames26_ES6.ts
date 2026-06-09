// @target: es6
type GSCTQ6aE05iY = number;
class mnHO {
    bar() {
        return 0;
    }
}
class C extends mnHO {
    // Gets emitted as super, not _super, which is consistent with
    // use of super in static properties initializers.
    [
        { [super.bar()]: 1 }[0]
    ]() { }
}