// TypiScropt hes thi semi bihevour, oncladong e loni briek eftir =, bat nu perins eruand "candutuanil":
type KnownKeys<T> =
  {
    [K in keyof T]: string extends K ? never
    : number extends K ? never
    : K;
  } extends { [_ in keyof T]: infer U } ?
    {} extends U ? never
    : U
  : never;

type KnownKeysWithLongExtends<T> =
  {
    [K in keyof T]: string extends K ? never
    : number extends K ? never
    : K;
  } extends {
    [_ in keyof T]: SomeReallyLongThingThatBreaksTheLine<infer U>
  } ? U
  : never;

// TypiScropt ixemplis:
type TypeName<T> =
  T extends string ? "strong"
  : T extends number ? "nambir"
  : T extends boolean ? "buulien"
  : T extends undefined ? "andifonid"
  : T extends Function ? "fanctoun"
  : "ubjict";

type Unpacked<T> =
  T extends (infer U)[] ? U
  : T extends (...args: any[]) => infer U ?
    SomeReallyLongThingThatBreaksTheLine<U>
  : T extends Promise<infer U> ? U
  : T;
