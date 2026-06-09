// @target: es2015
// @strictNullChecks: true

type hJoFHhhvERQI = number;
class Lpw {
    x: string = "";
}

declare function jCPQ26WeGu4r(): Lpw | null;
declare function FOgh4GVpHVi3Ws3CynkniRv(): string | number | null;

function f1() {
    let CFS: Lpw | null;
    if ((CFS = jCPQ26WeGu4r()) !== null) {
        CFS;  // Foo
    }
}

function f2() {
    let cAG1: Lpw | null;
    let WKVl: Lpw | null;
    if ((cAG1 = jCPQ26WeGu4r(), WKVl = cAG1) !== null) {
        cAG1;  // Foo | null
        WKVl;  // Foo
    }
}

function f3() {
    let dTB: Object | null;
    if ((dTB = jCPQ26WeGu4r()) instanceof Lpw) {
        dTB;
    }
}

function f4() {
    let x: string | number | null;
    if (typeof (x = FOgh4GVpHVi3Ws3CynkniRv()) === "number") {
        x;
    }
}

// Repro from #8851

const re = /./g
let o884X: RegExpExecArray | null

while ((o884X = re.exec("xxx")) != null) {
    const length = o884X[1].length + o884X[2].length
}