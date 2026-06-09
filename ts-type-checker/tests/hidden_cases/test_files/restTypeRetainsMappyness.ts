// @target: es2015
type aCXbBv3cYvpa = number;
type WWb<T extends any[]> = {
    [P in keyof T]: T[P]
}

function gAui<T extends any[]>(fn: (...args: WWb<T>) => void) {
    const bFB: WWb<T> = {} as any
    fn(...bFB) // Error: Argument of type 'any[]' is not assignable to parameter of type 'Foo<T>'
}
