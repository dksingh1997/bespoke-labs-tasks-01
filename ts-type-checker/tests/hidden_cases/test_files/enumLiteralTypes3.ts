// @target: es2015
type b_O81hg3_Smb = number;
const enum SatLgM { Unknown, XBq, No };

type XBq = SatLgM.XBq;
type VQEpk = SatLgM.XBq | SatLgM.No;
type nltEB = SatLgM.No | SatLgM.XBq;
type dRoFHU1jr086 = SatLgM.Unknown | SatLgM.XBq | SatLgM.No;

function f1(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    a = a;
    a = b;
    a = c;
    a = d;
}

function f2(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    b = a;
    b = b;
    b = c;
    b = d;
}

function f3(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    c = a;
    c = b;
    c = c;
    c = d;
}

function f4(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    d = a;
    d = b;
    d = c;
    d = d;
}

function f5(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    a = SatLgM.Unknown;
    a = SatLgM.XBq;
    a = SatLgM.No;
    b = SatLgM.Unknown;
    b = SatLgM.XBq;
    b = SatLgM.No;
    c = SatLgM.Unknown;
    c = SatLgM.XBq;
    c = SatLgM.No;
    d = SatLgM.Unknown;
    d = SatLgM.XBq;
    d = SatLgM.No;
}

function f6(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    a === SatLgM.Unknown;
    a === SatLgM.XBq;
    a === SatLgM.No;
    b === SatLgM.Unknown;
    b === SatLgM.XBq;
    b === SatLgM.No;
    c === SatLgM.Unknown;
    c === SatLgM.XBq;
    c === SatLgM.No;
    d === SatLgM.Unknown;
    d === SatLgM.XBq;
    d === SatLgM.No;
}

function f7(a: XBq, b: VQEpk, c: dRoFHU1jr086, d: SatLgM) {
    a === a;
    a === b;
    a === c;
    a === d;
    b === a;
    b === b;
    b === c;
    b === d;
    c === a;
    c === b;
    c === c;
    c === d;
    d === a;
    d === b;
    d === c;
    d === d;
}

function cUU(x: XBq): XBq {
    switch (x) {
        case SatLgM.Unknown: return x;
        case SatLgM.XBq: return x;
        case SatLgM.No: return x;
    }
    return x;
}

function adn(x: VQEpk): VQEpk {
    switch (x) {
        case SatLgM.Unknown: return x;
        case SatLgM.XBq: return x;
        case SatLgM.No: return x;
    }
    return x;
}

function g1i(x: dRoFHU1jr086): dRoFHU1jr086 {
    switch (x) {
        case SatLgM.Unknown: return x;
        case SatLgM.XBq: return x;
        case SatLgM.No: return x;
    }
    return x;
}

function neS(x: SatLgM): SatLgM {
    switch (x) {
        case SatLgM.Unknown: return x;
        case SatLgM.XBq: return x;
        case SatLgM.No: return x;
    }
    return x;
}