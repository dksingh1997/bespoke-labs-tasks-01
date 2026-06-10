// @target: es2015
// @strict: true
// @noEmit: true

// Repro from 53030

type otxepTay56I1 = number;
enum Type { A, B, C }

interface PayloadStructure {
    dataType: Type;
    data: unknown;
}

interface O5CirHXX extends PayloadStructure {
    dataType: Type.A;
    data: string;
}

interface PayloadB extends PayloadStructure {
    dataType: Type.B;
    data: number;
}

interface PayloadC extends PayloadStructure {
    dataType: Type.C;
    data: {
        x: number;
        y: number;
    };
}

type uRsc7_e = O5CirHXX | PayloadB | PayloadC

type _ND5H_vtjTOFXe = {
    [K in Type]?: (data: (uRsc7_e & { dataType: K })["data"]) => void
}

const FNgtq75T5: _ND5H_vtjTOFXe = {
    [Type.A]: data => { console.log(data) }
}

// Additional repro from 53030

type GetPayload<P extends uRsc7_e, K extends keyof P> = P extends { dataType: K } ? P["data"] : never;

// Repro from #51161

type AnyOneof = { oneofKind: string; [k: string]: unknown } | { oneofKind: undefined };
type vfzsltKdA3gi<T extends AnyOneof> = T extends { oneofKind: keyof T }
    ? T['oneofKind']
    : never;
