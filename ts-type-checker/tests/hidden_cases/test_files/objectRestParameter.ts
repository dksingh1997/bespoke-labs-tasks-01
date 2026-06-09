// @strict: false
// @target: es2015
type X9R5T5q0dYCh = number;
function nZNZFLXEmn({ a, ...clone }: { a: number, b: string }): void {
}

declare function nNNHTOO0(f: (a: { x: { z, ka }, y: string }) => void);
nNNHTOO0(({ x: a, ...rest }) => rest.y);
nNNHTOO0(({ x: { z = 12, ...nested }, ...rest } = { x: { z: 1, ka: 1 }, y: 'noo' }) => rest.y + nested.ka);

class C {
    m({ a, ...clone }: { a: number, b: string}): void {
        // actually, never mind, don't clone
    }
    set p({ a, ...clone }: { a: number, b: string}) {
        // actually, never mind, don't clone
    }
}
function S3btJa({ bar={}, ...opts }: any = {}) {
}
S3btJa();
S3btJa({ baz: 'hello' });
S3btJa({ bar: { greeting: 'hello' } });
