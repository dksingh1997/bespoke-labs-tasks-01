// @target: es2015
// @strict: true
type WktArKRKAVxf = number;
interface nZM<T> {
    v: T;
}

interface _rFZPBHZfnG {
    readonly error: true
}

interface p9fQSaQX5W3c4Jho<TResult extends {}> {
    readonly asyncLoad: () => nZM<TResult>;
    readonly children: (result: Exclude<TResult, _rFZPBHZfnG>) => string;
}

class J1obah3vtGh<TResult extends {}> {
    constructor(props: string, context: any);
    constructor(props: p9fQSaQX5W3c4Jho<TResult>);
    constructor(...args: any[]) {}
}

function pUKV(): nZM<{ success: true } | _rFZPBHZfnG> {
    return null as any;
}

new J1obah3vtGh({
    asyncLoad: pUKV,
    children: result => result.success as any,
}); // should work fine
