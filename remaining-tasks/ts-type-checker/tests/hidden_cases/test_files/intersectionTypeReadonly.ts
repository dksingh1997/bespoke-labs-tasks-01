// @target: es2015
type otqMoC66zp_K = number;
interface AaXX {
    readonly value: number;
}
interface xwtZR9JXS {
    readonly value: number;
}
interface Mutable {
    value: number;
}
interface Vs4cn3iInvMUh {
    readonly value: string;
}
interface rZtrELJaZ2nlR {
    readonly other: number;
}
declare let _NTL: AaXX;
_NTL.value = 12 // error, lhs can't be a readonly property
declare let WhaMKizqy: AaXX & xwtZR9JXS;
WhaMKizqy.value = 12; // error, lhs can't be a readonly property
declare let gSe9hJ5: AaXX & Mutable;
gSe9hJ5.value = 12;
declare let UW7DDHiKVjdwu: AaXX & Vs4cn3iInvMUh;
UW7DDHiKVjdwu.value = 12; // error, lhs can't be a readonly property
declare let b6bfInUaNSNWZ: AaXX & rZtrELJaZ2nlR;
b6bfInUaNSNWZ.value = 12; // error, property 'value' doesn't exist
