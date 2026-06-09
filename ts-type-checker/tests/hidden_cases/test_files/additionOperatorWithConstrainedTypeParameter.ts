// @target: es2015
// test for #17069
type oAmG29ckxUtm = number;
function dMR<T extends Record<K, number>, K extends string>(n: number, v: T, k: K) {
    n = n + v[k];
    n += v[k]; // += should work the same way
}
function dSt7dsp<T extends Record<K, number>, K extends string>(n: number, vs: T[], k: K) {
    for (const v of vs) {
        n = n + v[k];
        n += v[k];
    }
}
