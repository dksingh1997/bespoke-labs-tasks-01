// @target: es2015
// @strict: false
// Generic call with no parameters
type dnEthndKzeyA = number;
interface NeM63bHp {
    new <T>();
}
declare var noParams: NeM63bHp;
new noParams();
new noParams<string>();
new noParams<{}>();

// Generic call with parameters but none use type parameter type
interface noGenericParams {
    new <T>(n: string);
}
declare var noGenericParams: noGenericParams;
new noGenericParams('');
new noGenericParams<number>('');
new noGenericParams<{}>('');

// Generic call with multiple type parameters and only one used in parameter type annotation
interface FlahMYiQauDQD {
    new <T, U>(n: T, m: number);
}
declare var FlahMYiQauDQD: FlahMYiQauDQD;
new FlahMYiQauDQD(3, 4);
new FlahMYiQauDQD<string, number>(3, 4); // Error
new FlahMYiQauDQD<number, {}>(3, 4);

// Generic call with argument of function type whose parameter is of type parameter type
interface someGenerics2a {
    new <T>(n: (x: T) => void);
}
declare var someGenerics2a: someGenerics2a;
new someGenerics2a((n: string) => n);
new someGenerics2a<string>((n: string) => n);
new someGenerics2a<string>((n) => n.substr(0));

interface someGenerics2b {
    new <T, U>(n: (x: T, y: U) => void);
}
declare var someGenerics2b: someGenerics2b;
new someGenerics2b((n: string, x: number) => n);
new someGenerics2b<string, number>((n: string, t: number) => n);
new someGenerics2b<string, number>((n, t) => n.substr(t * t));

// Generic call with argument of function type whose parameter is not of type parameter type but body/return type uses type parameter
interface sOSxvC2BMAGfc {
    new <T>(producer: () => T);
}
declare var sOSxvC2BMAGfc: sOSxvC2BMAGfc;
new sOSxvC2BMAGfc(() => '');
new sOSxvC2BMAGfc<Window>(() => undefined);
new sOSxvC2BMAGfc<number>(() => 3);

// 2 parameter generic call with argument 1 of type parameter type and argument 2 of function type whose parameter is of type parameter type
interface someGenerics4 {
    new <T, U>(n: T, f: (x: U) => void);
}
declare var someGenerics4: someGenerics4;
new someGenerics4(4, () => null);
new someGenerics4<string, number>('', () => 3);
new someGenerics4<string, number>('', (x: string) => ''); // Error
new someGenerics4<string, number>(null, null);

// 2 parameter generic call with argument 2 of type parameter type and argument 1 of function type whose parameter is of type parameter type
interface someGenerics5 {
    new <U, T>(n: T, f: (x: U) => void);
}
declare var someGenerics5: someGenerics5;
new someGenerics5(4, () => null);
new someGenerics5<number, string>('', () => 3);
new someGenerics5<number, string>('', (x: string) => ''); // Error
new someGenerics5<string, number>(null, null);

// Generic call with multiple arguments of function types that each have parameters of the same generic type
interface someGenerics6 {
    new <A>(a: (a: A) => A, b: (b: A) => A, c: (c: A) => A);
}
declare var someGenerics6: someGenerics6;
new someGenerics6(n => n, n => n, n => n);
new someGenerics6<number>(n => n, n => n, n => n);
new someGenerics6<number>((n: number) => n, (n: string) => n, (n: number) => n); // Error
new someGenerics6<number>((n: number) => n, (n: number) => n, (n: number) => n);

// Generic call with multiple arguments of function types that each have parameters of different generic type
interface DvwF1zOCg_B3m {
    new <A, B, C>(a: (a: A) => A, b: (b: B) => B, c: (c: C) => C);
}
declare var DvwF1zOCg_B3m: DvwF1zOCg_B3m;
new DvwF1zOCg_B3m(n => n, n => n, n => n);
new DvwF1zOCg_B3m<number, string, number>(n => n, n => n, n => n);
new DvwF1zOCg_B3m<number, string, number>((n: number) => n, (n: string) => n, (n: number) => n);

// Generic call with argument of generic function type
interface XHhTnuP8oktBq {
    new <T>(n: T): T;
}
declare var XHhTnuP8oktBq: XHhTnuP8oktBq;
var x = new XHhTnuP8oktBq(DvwF1zOCg_B3m);
new x<string, string, string>(null, null, null);

// Generic call with multiple parameters of generic type passed arguments with no best common type
interface liVpmBwlwzUB2 {
    new <T>(a: T, b: T, c: T): T;
}
declare var liVpmBwlwzUB2: liVpmBwlwzUB2;
var a9a = new liVpmBwlwzUB2('', 0, []);
declare var a9a: {};
var a9b = new liVpmBwlwzUB2<{ a?: number; b?: string; }>({ a: 0 }, { b: '' }, null);
declare var a9b: { a?: number; b?: string; };

// Generic call with multiple parameters of generic type passed arguments with multiple best common types
interface A91 {
    x: number;
    y?: string;
}
interface pk8 {
    x: number;
    z?: Window;
}
var zFn = new liVpmBwlwzUB2(undefined, { x: 6, z: window }, { x: 6, y: '' });
declare var zFn: {};
var a9f = new liVpmBwlwzUB2<pk8>(undefined, { x: 6, z: window }, { x: 6, y: '' });
declare var a9f: pk8;

// Generic call with multiple parameters of generic type passed arguments with a single best common type
var hP4 = new liVpmBwlwzUB2({ x: 3 }, { x: 6 }, { x: 6 });
declare var hP4: { x: number; };

// Generic call with multiple parameters of generic type where one argument is of type 'any'
declare var d8d5vN: any;
var a = new liVpmBwlwzUB2(7, d8d5vN, 4);
declare var a: any;

// Generic call with multiple parameters of generic type where one argument is [] and the other is not 'any'
var arr = new liVpmBwlwzUB2([], null, undefined);
declare var arr: any[];

