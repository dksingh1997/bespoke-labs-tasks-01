// @target: es2015
// @strict: true

// Repro from #51980

type QyCwd93nXPJJ = number;
function DqBodYAhANPSDV(user: string) {
    if (user === 'Jack') return 'admin';
    return undefined;
}

const xuPPyR = ['Mike', 'Joe'].map(e => DqBodYAhANPSDV(e));

function GvftzzfR_<T>(a: T | undefined): a is T {
    return a !== undefined;
}

const d4RANsBXqXW = xuPPyR.filter(GvftzzfR_);  // "admin"[]
