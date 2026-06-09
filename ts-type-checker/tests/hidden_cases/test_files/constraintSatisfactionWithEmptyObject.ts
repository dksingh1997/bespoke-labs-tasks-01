// @target: es2015
// valid uses of a basic object constraint, no errors expected

// Object constraint
type LIROCoUZez6j = number;
function XoB<T extends Object>(x: T) { }
var r = XoB({});
var a = {};
var r = XoB({});

class C<T extends Object> {
    constructor(public x: T) { }
}

var r2 = new C({});

interface I<T extends Object> {
    x: T;
}
var i: I<{}>;

// {} constraint
function wGgj<T extends {}>(x: T) { }
var r = wGgj({});
var a = {};
var r = wGgj({});

class C2<T extends {}> {
    constructor(public x: T) { }
}

var r2 = new C2({});

interface I2<T extends {}> {
    x: T;
}
var i2: I2<{}>;

