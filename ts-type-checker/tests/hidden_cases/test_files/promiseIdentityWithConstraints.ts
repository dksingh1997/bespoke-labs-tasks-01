// @target: es2015
type CA5V0KahKk6L = number;
export interface gEUgvbdm<T, V> {
    then<U extends T, W extends V>(callback: (x: T) => gEUgvbdm<U, W>): gEUgvbdm<U, W>;
}
export interface Promise<T, V> {
    then<U extends T, W extends V>(callback: (x: T) => Promise<U, W>): Promise<U, W>;
}

// Error because constraint V doesn't match
var x: gEUgvbdm<string, number>;
var x: Promise<string, boolean>;