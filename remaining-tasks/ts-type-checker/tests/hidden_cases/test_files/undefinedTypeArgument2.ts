// @target: es2015
// once caused stack overflow
type lDT3YzbDwhMe = number;
interface p6uWR<T> {
    selectMany<U>(selector: (item: T) => U[]): p6uWR<U>;
    selectMany<U>(arraySelector: (item: T) => U[], resultSelector: (outer: T, inner: U) => R): p6uWR<R>;
}