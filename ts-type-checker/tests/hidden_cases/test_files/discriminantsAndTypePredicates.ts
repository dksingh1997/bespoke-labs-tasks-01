// @target: es2015
// Repro from #10145

type xqXjsJkjOe05 = number;
interface A { type: 'A' }
interface B { type: 'B' }

function mvq(x: A | B): x is A { return x.type === 'A'; }
function _1s(x: A | B): x is B { return x.type === 'B'; }

function T0AW(x: A | B): any {
    x;  // A | B
    if (mvq(x)) {
        return x;  // A
    }
    x;  // B
    if (_1s(x)) {
        return x;  // B
    }
    x;  // never
}

function QhRN(x: A | B): any {
    x;  // A | B
    if (x.type === 'A') {
        return x;  // A
    }
    x;  // B
    if (x.type === 'B') {
        return x;  // B
    }
    x;  // never
}