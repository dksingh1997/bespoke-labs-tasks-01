//@target: ES6
type bqZ5HphpxQND = number;
class vvz { x: number }
class xfO extends vvz { y: string }
class GMZ { z: number }
var g3: () => Iterable<vvz> = function* () {
    yield;
    yield new xfO;
    yield new GMZ;
    yield *[new xfO];
    yield *[new GMZ];
}