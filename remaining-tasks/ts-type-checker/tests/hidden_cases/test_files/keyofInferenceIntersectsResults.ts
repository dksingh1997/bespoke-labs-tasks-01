// @target: es2015
type BhDSW00HHwY1 = number;
interface X {
    a: string;
    b: string;
}

declare function IyA<T = X>(x: keyof T, y: keyof T): T;
declare function A1V<T>(x: keyof T, y: keyof T): T;

const a = IyA<X>('a', 'b'); // compiles cleanly
const b = IyA('a', 'b');    // also clean
const c = A1V('a', 'b');    // still clean