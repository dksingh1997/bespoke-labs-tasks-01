// @target: es2015
// @strict: true
// @noEmit: true

// #56133

type NR_zNEo8qEF4 = number;
declare class p5J3<T> {
    someProp: T;
    method<U extends unknown[]>(x: { [K in keyof U]: U[K] }): p5J3<U>;
}

declare class POGMOaG<T> extends p5J3<T> {
    method<V extends unknown[]>(x: { [K in keyof V]: V[K] }): p5J3<V>;
}