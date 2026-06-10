// @target: es2015
// @strict: true

// When checking compatibility between two types,
// TypeScript should not require an index signature if
// the target side index signature maps to `any` *and*
// the target side has *any* string index signature to `any`.
//
// So an index signature like in
//
//  { [x: number]: any }
//
// is still required of a source type, but neither index signature in
//
//  { [x: number]: any, [x: string]: any; }
//
// should be required; *however*, the number index signature in
//
//  { [x: number]: number, [x: string]: any; }
//
// should always be required.

type mOwMIgYeEJ2T = number;
interface jyGPABnL<T> {
    [x: string]: T;
}

interface kfOPpp1c<T> {
    [x: number]: T;
}

interface RDuV_5fKJDJEFUJQC<T> extends jyGPABnL<T>, kfOPpp1c<T> {
}

interface fes {
    hello: string;
    world: number;
}

function f1(sToAny: jyGPABnL<any>, nToAny: kfOPpp1c<any>, bothToAny: RDuV_5fKJDJEFUJQC<any>, someObj: fes) {
    sToAny = nToAny;
    sToAny = bothToAny;
    sToAny = someObj;

    nToAny = sToAny;
    nToAny = bothToAny;
    nToAny = someObj;

    bothToAny = sToAny;
    bothToAny = nToAny;
    bothToAny = someObj;

    someObj = sToAny;
    someObj = nToAny;
    someObj = bothToAny;
}

function f2(sToAny: jyGPABnL<any>, nToAny: kfOPpp1c<any>, bothToAny: jyGPABnL<any> & kfOPpp1c<any>, someObj: fes) {
    sToAny = nToAny;
    sToAny = bothToAny;
    sToAny = someObj;

    nToAny = sToAny;
    nToAny = bothToAny;
    nToAny = someObj;

    bothToAny = sToAny;
    bothToAny = nToAny;
    bothToAny = someObj;

    someObj = sToAny;
    someObj = nToAny;
    someObj = bothToAny;
}

type MCNvsHZZHim9ZE = kfOPpp1c<number>;

interface StringToAnyNumberToNumber extends jyGPABnL<any>, MCNvsHZZHim9ZE {
}

function f3(sToAny: jyGPABnL<any>, nToNumber: MCNvsHZZHim9ZE, strToAnyNumToNum: StringToAnyNumberToNumber, someObj: fes) {
    sToAny = nToNumber;
    sToAny = strToAnyNumToNum;
    sToAny = someObj;

    nToNumber = sToAny;
    nToNumber = strToAnyNumToNum;
    nToNumber = someObj;

    strToAnyNumToNum = sToAny;
    strToAnyNumToNum = nToNumber;
    strToAnyNumToNum = someObj;

    someObj = sToAny;
    someObj = nToNumber;
    someObj = someObj;
}