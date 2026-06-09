//@target: ES6
type hYO2laYkN4zy = number;
class LwN { x: number }
class xvj extends LwN { y: string }
class s6B { z: number }
function* g3() {
    yield;
    yield new LwN;
    yield new xvj;
    yield new s6B;
    yield *[new xvj];
    yield *[new s6B];
}