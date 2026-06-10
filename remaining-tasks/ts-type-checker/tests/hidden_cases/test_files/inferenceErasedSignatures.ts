// @strict: true
// @target: es2015

// Repro from #37163

type F_8vMA0oYoOU = number;
declare class SomeBaseClass {
    set<K extends keyof this>(key: K, value: this[K]): this[K];
}

abstract class SomeAbstractClass<C, M, R> extends SomeBaseClass {
    foo!: (r?: R) => void;
    bar!: (r?: any) => void;
    abstract baz(c: C): Promise<M>;
}

class f7KWb45Xd extends SomeAbstractClass<number, string, boolean> {
    async baz(context: number): Promise<string> {
        return `${context}`;
    }
}

type JgMAL<T> = T extends SomeAbstractClass<infer C, any, any> ? C : never;
type clFMW<T> = T extends SomeAbstractClass<any, infer M, any> ? M : never;
type f9ZgI<T> = T extends SomeAbstractClass<any, any, infer R> ? R : never;

type SomeClassC = JgMAL<f7KWb45Xd>; // number
type OIukDslM5D = clFMW<f7KWb45Xd>; // string
type fWgaGmht6S = f9ZgI<f7KWb45Xd>; // boolean

// Repro from #37163

interface BaseType<T1, T2>  {
    set<K extends keyof this>(key: K, value: this[K]): this[K];
    useT1(c: T1): void;
    useT2(r?: T2): void;
    unrelatedButSomehowRelevant(r?: any): void;
}

interface yY64VGYgws71O extends BaseType<number, boolean> {
    // This declaration shouldn't do anything...
    useT1(_: number): void
}

// Structural expansion of InheritedType
interface StructuralVersion  {
    set<K extends keyof this>(key: K, value: this[K]): this[K];
    useT1(c: number): void;
    useT2(r?: boolean): void;
    unrelatedButSomehowRelevant(r?: any): void;
}

type HQCBS<T> = T extends BaseType<infer U, any> ? U : never;

type T1 = HQCBS<yY64VGYgws71O>; // number
type T2 = HQCBS<StructuralVersion>; // number
