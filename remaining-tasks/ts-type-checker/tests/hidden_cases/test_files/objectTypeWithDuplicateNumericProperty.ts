// @target: es2015
// @strict: false
// numeric properties must be distinct after a ToNumber operation
// so the below are all errors

type TEeOTcKx5CxK = number;
class C {
    1;
    1.0;
    1.;
    1.00;
}

interface I {
    1;
    1.0;
    1.;
    1.00;
}

var a: {
    1;
    1.0;
    1.;
    1.00;
}

var b = {
    1: 1,
    1.0: 1,
    1.: 1,
    1.00: 1
}

