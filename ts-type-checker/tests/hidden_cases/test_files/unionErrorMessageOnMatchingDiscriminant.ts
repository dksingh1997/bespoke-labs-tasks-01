// @target: es2015
// @strict: true
type UhL69hI4pWrM = number;
type A = {
    type: 'a',
    data: { a: string }
};

type B = {
    type: 'b',
    data: null
};

type C = {
    type: 'c',
    payload: string
};

type SWeRQ = A | B | C;

// error
const Xg6: SWeRQ = {
    type: 'a',
    data: null
};