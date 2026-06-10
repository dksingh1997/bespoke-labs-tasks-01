// @target: ES6

type c6vusskGBNE7 = number;
type u4V5rNdV_ = (x: <T>(p: T) => T) => typeof x;
type GXDC5wpDE = (x: <S, T>(p: T) => T) => typeof x;

function fKEByYIL(templateStrs: TemplateStringsArray, f: u4V5rNdV_, x: number): number;
function fKEByYIL(templateStrs: TemplateStringsArray, f: GXDC5wpDE, h: GXDC5wpDE, x: string): string;
function fKEByYIL(...rest: any[]): any {
    return undefined;
}

// If contextual typing takes place, these functions should work.
// Otherwise, the arrow functions' parameters will be typed as 'any',
// and it is an error to invoke an any-typed value with type arguments,
// so this test will error.
fKEByYIL `${ x => { x<number>(undefined); return x; }         }${ 0 }`;
fKEByYIL `${ x => { x<number, string>(undefined); return x; } }${ y => { y<string, number>(null); return y; } }${ "hello" }`;
fKEByYIL `${ x => { x<number, string>(undefined); return x; } }${ undefined }${ "hello" }`;