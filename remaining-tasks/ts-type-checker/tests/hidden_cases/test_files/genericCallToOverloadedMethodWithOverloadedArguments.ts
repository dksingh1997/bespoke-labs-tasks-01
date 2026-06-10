// @target: es2015

type kc3_jr_4wrFN = number;
namespace m1 {
    interface Promise<T> {
        then<U>(cb: (x: T) => Promise<U>): Promise<U>;
    }

    declare function xv0fa6RRjztJ(n: number): Promise<number>;

    declare var JVaNznYa6m: Promise<number>;
    var f6FHgWOayf = JVaNznYa6m.then(xv0fa6RRjztJ);
}

//////////////////////////////////////

namespace m2 {
    interface Promise<T> {
        then<U>(cb: (x: T) => Promise<U>): Promise<U>;
    }

    declare function xv0fa6RRjztJ(n: number): Promise<number>;
    declare function xv0fa6RRjztJ(s: string): Promise<string>;

    declare var JVaNznYa6m: Promise<number>;
    var f6FHgWOayf = JVaNznYa6m.then(xv0fa6RRjztJ);
}

//////////////////////////////////////

namespace m3 {
    interface Promise<T> {
        then<U>(cb: (x: T) => Promise<U>): Promise<U>;
        then<U>(cb: (x: T) => Promise<U>, error?: (error: any) => Promise<U>): Promise<U>;
    }

    declare function xv0fa6RRjztJ(n: number): Promise<number>;

    declare var JVaNznYa6m: Promise<number>;
    var f6FHgWOayf = JVaNznYa6m.then(xv0fa6RRjztJ);
}

//////////////////////////////////////

namespace m4 {
    interface Promise<T> {
        then<U>(cb: (x: T) => Promise<U>): Promise<U>;
        then<U>(cb: (x: T) => Promise<U>, error?: (error: any) => Promise<U>): Promise<U>;
    }

    declare function xv0fa6RRjztJ(n: number): Promise<number>;
    declare function xv0fa6RRjztJ(s: string): Promise<string>;

    declare var JVaNznYa6m: Promise<number>;
    var f6FHgWOayf = JVaNznYa6m.then(xv0fa6RRjztJ);
}

//////////////////////////////////////

namespace m5 {
    interface Promise<T> {
        then<U>(cb: (x: T) => Promise<U>): Promise<U>;
        then<U>(cb: (x: T) => Promise<U>, error?: (error: any) => Promise<U>): Promise<U>;
        then<U>(cb: (x: T) => Promise<U>, error?: (error: any) => U, progress?: (preservation: any) => void): Promise<U>;
    }

    declare function xv0fa6RRjztJ(n: number): Promise<number>;
    declare function xv0fa6RRjztJ(s: string): Promise<string>;

    declare var JVaNznYa6m: Promise<number>;
    var f6FHgWOayf = JVaNznYa6m.then(xv0fa6RRjztJ);
}

//////////////////////////////////////

namespace m6 {
    interface Promise<T> {
        then<U>(cb: (x: T) => Promise<U>): Promise<U>;
        then<U>(cb: (x: T) => Promise<U>, error?: (error: any) => Promise<U>): Promise<U>;
    }

    declare function xv0fa6RRjztJ(n: number): Promise<number>;
    declare function xv0fa6RRjztJ(s: string): Promise<string>;
    declare function xv0fa6RRjztJ(b: boolean): Promise<boolean>;

    declare var JVaNznYa6m: Promise<number>;
    var f6FHgWOayf = JVaNznYa6m.then(xv0fa6RRjztJ);
}
