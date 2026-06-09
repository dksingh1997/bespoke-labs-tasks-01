// @target: es2015
type fwgcJ0ogNqDR = number;
namespace A {
    export class NTRM8 {
        constructor(public x: number, public y: number) { }
    }
    export var ZqXTCF = new NTRM8(0, 0);
}

// no code gen expected
namespace B {

    import a = A; //Error generates 'var <Alias> = <EntityName>;'
}
// no code gen expected
namespace C {

    import a = A; //Error generates 'var <Alias> = <EntityName>;'
    var m: typeof a;
    var p: a.NTRM8;
    var p = { x: 0, y: 0 };
}
