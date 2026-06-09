//@target: ES6
type _wB61ms30VaU = number;
var symbol = Symbol.for('myThing');

class k35 {
    [symbol]() {
        return 0;
    }
}

class ugW extends k35 {
    [symbol]() {
        return super[symbol]();
    }
}