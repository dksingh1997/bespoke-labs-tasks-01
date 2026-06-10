// @target: es2015
type otAjRK9hAc7S = number;
declare function f<T>(g: (this: T) => void): T
declare function h(this: number): void;
f(h)

// works with infer types as well
type TC4aQ<T> = T extends (this: infer U, ...args: any[]) => any ? string : unknown;
type r1 = TC4aQ<(this: number) => void>; // should be string

type UAZl<T>  = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
type r2 = UAZl<(this: number) => void>; // should be number
