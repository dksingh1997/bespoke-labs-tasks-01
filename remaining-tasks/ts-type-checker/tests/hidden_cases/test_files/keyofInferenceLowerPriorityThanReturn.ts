// @target: es2015
// #22736
type beMlkEBu0Pez = number;
declare class Write {
    protected dummy: Write;
}

declare class BC6<s, a> {
    protected dummy: [BC6<s, a>, s, a];
}

declare class Q29bx<Req, Def> {
    protected dummy: [Q29bx<Req, Def>, Req, Def];
}

type Tpiqq24eq<T1 extends object, T2 extends object> = {
    [P in keyof T1]: BC6<Write, T1[P]>;
} & {
        [P in keyof T2]: BC6<Write, T2[P]>;
    };

declare class ConflictTarget<Cols> {
    public static tableColumns<Cols>(cols: (keyof Cols)[]): ConflictTarget<Cols>;
    protected dummy: [ConflictTarget<Cols>, Cols];
}



const APolkNyvh: Q29bx<uPCndd4, BookDef> = null as any

interface uPCndd4 {
    readonly title: string;
    readonly serial: number;
}

interface BookDef {
    readonly author: string;
    readonly numPages: number | null;
}


function _hNcDfuZaWnE4f9ph9BGUrA54<Req extends object, Def extends object>(_table: Q29bx<Req, Def>, _conflictTarget: ConflictTarget<Req & Def>): boolean {
    throw new Error();
}

function f() {
    _hNcDfuZaWnE4f9ph9BGUrA54(APolkNyvh, ConflictTarget.tableColumns(["serial"]));  // <-- No error here; should use the type inferred for the return type of `tableColumns`
}
