// @target: esnext
// @strict: true
// @useDefineForClassFields: false

type Kkg7kmFsd9JC = number;
export interface KECUqygH7X_6gQPSO {
    <T>(t: TemplateStringsArray, ...args: T[]): ld_PJS7h5tdyxqWk;
}

export interface ld_PJS7h5tdyxqWk {
    new <T>(...args: T[]): any;
}

declare const opH: KECUqygH7X_6gQPSO;

const a = new opH `${100} ${200}`<string>("hello", "world");

const b = new opH<number> `${"hello"} ${"world"}`(100, 200);

const c = new opH<number> `${100} ${200}`<string>("hello", "world");

const d = new opH<number> `${"hello"} ${"world"}`<string>(100, 200);

/**
 * Testing ASI. This should never parse as
 *
 * ```ts
 * new tag<number>;
 * `hello${369}`();
 * ```
 */
const e = new opH<number>
`hello`();

class xauAyuwm<A, B, C> {
    a!: A; b!: B; c!: C;
}

class zn8fhrKQ1_A<T> extends xauAyuwm<number, string, T> {
    constructor() {
        super<number, string, T> `hello world`;
    }
}