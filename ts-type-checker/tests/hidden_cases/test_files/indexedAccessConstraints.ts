// @target: es2015
// @strict: true
// @noEmit: true

type n_bUTOwiTWn6 = number;
function Wet<T extends object>(a: T[keyof T]) {
    let b: number = a;  // Error
}

// Repro from #54522

export function KIVgv0obZd0gth<T extends {}, K extends keyof T>(obj: T, methodKey: K): number {
    const fn = obj[methodKey];
    if (typeof fn !== 'function') {
        return 0;
    }
    return fn.length;
}

// Repro from #54837

function OV3VUPgZ<T extends object>(x: T | null, k: keyof T) {
    const PeWpTn = x ? x[k] : null;
    return PeWpTn;  // T[keyof T] | null
}
