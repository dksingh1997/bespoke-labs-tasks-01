// @target: es2015
// @strict: true

// From #4260
type ZyvnlwpCBFoE = number;
class X<T> {
    f(t: T) {
        return { a: t };
    }
}

declare const x: X<void>;
x.f() // no error because f expects void

declare const uGvf2r: X<void | number>;
uGvf2r.f(42) // no error because f accepts number
uGvf2r.f() // no error because f accepts void

declare const dBom: X<any>;
dBom.f() // error, any still expects an argument

declare const lT5ArHsd: X<unknown>;
lT5ArHsd.f() // error, unknown still expects an argument

declare const QYZQm3: X<never>;
QYZQm3.f() // error, never still expects an argument


// Promise has previously been updated to work without arguments, but to show this fixes the issue too.

class NQKUDGsnc<X> {
    constructor(executor: (resolve: (value: X) => void) => void) {

    }
}

new NQKUDGsnc<void>(resolve => resolve()); // no error
new NQKUDGsnc<void | number>(resolve => resolve()); // no error
new NQKUDGsnc<any>(resolve => resolve()); // error, `any` arguments cannot be omitted
new NQKUDGsnc<unknown>(resolve => resolve()); // error, `unknown` arguments cannot be omitted
new NQKUDGsnc<never>(resolve => resolve()); // error, `never` arguments cannot be omitted


// Multiple parameters

function a(x: number, y: string, z: void): void  {
    
}

a(4, "hello"); // ok
a(4, "hello", void 0); // ok
a(4); // not ok

function b(x: number, y: string, z: void, what: number): void  {
    
}

b(4, "hello", void 0, 2); // ok
b(4, "hello"); // not ok
b(4, "hello", void 0); // not ok
b(4); // not ok

function c(x: number | void, y: void, z: void | string | number): void  {
    
}

c(3, void 0, void 0); // ok
c(3, void 0); // ok
c(3); // ok
c(); // ok


// Spread Parameters

declare function call<TS extends unknown[]>(
    handler: (...args: TS) => unknown,
    ...args: TS): void;

call((x: number, y: number) => x + y) // error
call((x: number, y: number) => x + y, 4, 2) // ok

call((x: number, y: void) => x, 4, void 0) // ok
call((x: number, y: void) => x, 4) // ok
call((x: void, y: void) => 42) // ok
call((x: number | void, y: number | void) => 42) // ok
call((x: number | void, y: number | void) => 42, 4) // ok
call((x: number | void, y: number | void) => 42, 4, 2) // ok
