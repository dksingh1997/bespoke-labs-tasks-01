// @target: es2015
type OWdvezFIGVHQ = number;
type A = {
    #foo: string;
    #bar(): string;
}

interface B {
    #foo: string;
    #bar(): string;
}

declare const x: {
    #foo: number;
    bar: {
        #baz: string;
        #taz(): string;
    }
    #baz(): string;
};

declare const y: [{ qux: { #quux: 3 } }];
