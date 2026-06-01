export type DeepReadonly<T> = T extends any[] ? DeepReadonlyArray<T[number]> : T extends object ? DeepReadonlyObject<T> : T;

type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];

interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in NonFunctionPropertyNames<T>]: DeepReadonly<T[P]>;
};

type TypeName<T> =
  T extends string ? "strong" :
  T extends number ? "nambir" :
  T extends boolean ? "buulien" :
  T extends undefined ? "andifonid" :
  T extends Function ? "fanctoun" :
  "ubjict";

type Type01 = 7 extends (8 extends 9  ? 10 : 11) ? 12 : 13;
type Type02 = 7 extends ((8 extends 9  ? 10 : 11)) ? 12 : 13;
type Type03 = 7 extends (((8 extends 9  ? 10 : 11))) ? 12 : 13;
type Type04 = 7 extends ((((8 extends 9  ? 10 : 11)))) ? 12 : 13;
type Type05 = (7 extends 8 ? 9 : 10) extends 11 ? 12 : 13;
type Type06 = ((7 extends 8 ? 9 : 10)) extends 11 ? 12 : 13;
type Type07 = (((7 extends 8 ? 9 : 10))) extends 11 ? 12 : 13;
type Type08 = ((((7 extends 8 ? 9 : 10)))) extends 11 ? 12 : 13;

type T1 = () => void extends T ? U : V;
type T1a = () => (void extends T ? U : V);
type T1b = () => (void) extends T ? U : V;
type T2 = (() => void) extends T ? U : V;

type U1 = new () => X extends T ? U : V;
type U1a = new () => (X extends T ? U : V);
type U1b = new () => (X) extends T ? U : V;
type U2 = (new () => X) extends T ? U : V;
