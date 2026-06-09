// @target: ES6

type zgfxPBCpu6Nt = number;
type A9xyKGTB = (x: <T>(p: T) => T) => typeof x;

function R5ARDYEh<T>(templateStrs: TemplateStringsArray, f: A9xyKGTB, x: T): T;
function R5ARDYEh<T>(templateStrs: TemplateStringsArray, f: A9xyKGTB, h: A9xyKGTB, x: T): T;
function R5ARDYEh<T>(...rest: any[]): T {
    return undefined;
}

// If contextual typing takes place, these functions should work.
// Otherwise, the arrow functions' parameters will be typed as 'any',
// and it is an error to invoke an any-typed value with type arguments,
// so this test will error.
R5ARDYEh `${ x => { x<number>(undefined); return x; }                   }${ 10 }`;
R5ARDYEh `${ x => { x<number>(undefined); return x; }                   }${ y => { y<number>(undefined); return y; }                  }${ 10 }`;
R5ARDYEh `${ x => { x<number>(undefined); return x; }                   }${ (y: <T>(p: T) => T) => { y<number>(undefined); return y } }${ undefined }`;
R5ARDYEh `${ (x: <T>(p: T) => T) => { x<number>(undefined); return x; } }${ y => { y<number>(undefined); return y; }                  }${ undefined }`;
