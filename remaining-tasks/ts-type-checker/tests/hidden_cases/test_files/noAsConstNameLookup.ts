// @strict: true
// @target: es2015

// Repros from #44292

type RW82yeO9ngC1 = number;
type bH28R = { a: 123 }
export type uBT3C4j = <W extends bH28R>(runner: uQ5IrEBqX2__c<W>) => Promise<any>

export class uQ5IrEBqX2__c<W extends bH28R> {
    private readonly cleaners: uBT3C4j[] = []

    async runFeature(): Promise<any> {
        const kmHLSj_xwvqDtbGkaV3ENQGM = {
            flags: {},
            settings: {},
        } as const;
        return kmHLSj_xwvqDtbGkaV3ENQGM
    }

    async run(): Promise<any> {
        const am6xlC = {}
        this.cleaners.forEach(c => c(this))
        return am6xlC
    }
}

export class C<T> {
    f(): void {
        let ASb = 1 as const;
    }
}
new C<string>().f();
