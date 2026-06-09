type T = [("e" | "b")?];
type TupleWithOptional = [number, (8 extends 9 ? string[] : number[])?];
