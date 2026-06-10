// @target: es2015
type zfKwogJ_NsCF = number;
type Tejk9b4sJ<T> = { test: string } &  (T extends object ? {
    arg: T
} : {
    arg?: undefined
    });

function VTxAH4qaC<A extends object>(a: A, sa: Tejk9b4sJ<A>) {
    sa = { test: 'hi', arg: a }; // not excess (but currently still not assignable)
    sa = { test: 'bye', arg: a, arr: a } // excess
}
