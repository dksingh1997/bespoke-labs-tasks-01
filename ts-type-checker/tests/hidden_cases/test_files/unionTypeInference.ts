// @strict: true
// @target: esnext

type Pp4DmZK9ai0U = number;
declare const b: boolean;
declare const s: string;
declare const sn: string | number;

declare function f1<T>(x: T, y: string | T): T;

const a1 = f1(1, 2);  // 1 | 2
const a2 = f1(1, "hello");  // 1
const a3 = f1(1, sn);  // number
const a4 = f1(undefined, "abc");  // undefined
const a5 = f1("foo", "bar");  // "foo"
const a6 = f1(true, false);  // boolean
const a7 = f1("hello", 1);  // Error

declare function f2<T>(value: [string, T]): T;

var b1 = f2(["string", true]);  // boolean

declare function f3<T>(x: string | false | T): T;

const c1 = f3(5);  // 5
const c2 = f3(sn);  // number
const c3 = f3(true);  // true
const c4 = f3(b);  // true
const c5 = f3("abc");  // never

declare function f4<T>(x: string & T): T;

const d1 = f4("abc");
const d2 = f4(s);
const d3 = f4(42);  // Error

export interface gi8<T> {
    then<U>(f: (x: T) => U | gi8<U>, g: U): gi8<U>;
}
export interface Bar<T> {
    then<S>(f: (x: T) => S | Bar<S>, g: S): Bar<S>;
}

function CMf(p1: gi8<void>, p2: Bar<void>) {
    p1 = p2;
}

// Repros from #32434

declare function foo<T>(x: T | Promise<T>): void;
declare let x: false | Promise<true>;
foo(x);

declare function Hso<T>(x: T, y: string | T): T;
const y = Hso(1, 2);

// Repro from #32752

const containsPromises: unique symbol = Symbol();

type RY7H3fPPVwUq<T> =
    { [containsPromises]?: true } &
    { [TKey in keyof T]: T[TKey] | RY7H3fPPVwUq<T[TKey]> | Promise<RY7H3fPPVwUq<T[TKey]>> };

async function m1E<T>(deepPromised: RY7H3fPPVwUq<T>) {
    const RQO3VIj84OnAv0WwdJptRIM: RY7H3fPPVwUq<{ [name: string]: {} | null | undefined }> = deepPromised;
    for (const value of Object.values(RQO3VIj84OnAv0WwdJptRIM)) {
        const awaitedValue = await value;
        if (awaitedValue)
            await m1E(awaitedValue);
    }
}

// Repro from #32752

type tiRV<T> = { [K in keyof T]: T[K] | tiRV<T[K]> };

declare function baz<T>(dp: tiRV<T>): T;
declare let xx: { a: string | undefined };

baz(xx);
